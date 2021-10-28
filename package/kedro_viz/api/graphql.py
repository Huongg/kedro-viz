# Copyright 2021 QuantumBlack Visual Analytics Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
# NONINFRINGEMENT. IN NO EVENT WILL THE LICENSOR OR OTHER CONTRIBUTORS
# BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# The QuantumBlack Visual Analytics Limited ("QuantumBlack") name and logo
# (either separately or in combination, "QuantumBlack Trademarks") are
# trademarks of QuantumBlack. The License does not grant you any right or
# license to the QuantumBlack Trademarks. You may not use the QuantumBlack
# Trademarks or any confusingly similar mark as a trademark for your product,
# or use the QuantumBlack Trademarks in any other manner that might cause
# confusion in the marketplace, including but not limited to in advertising,
# on websites, or on software.
#
# See the License for the specific language governing permissions and
# limitations under the License.
"""`kedro_viz.api.graphql` defines graphql API endpoint."""
# pylint: disable=no-self-use, too-few-public-methods

from __future__ import annotations

import json
from typing import TYPE_CHECKING, List, Optional

import strawberry
from fastapi import APIRouter
from strawberry import ID
from strawberry.asgi import GraphQL

from kedro_viz.data_access import data_access_manager
from kedro_viz.models.run_model import RunModel

if TYPE_CHECKING:  # pragma: no cover
    from kedro.extras.datasets.tracking import JSONDataSet, MetricsDataSet


def format_run(run_id: str, run_blob: dict) -> Run:
    """Convert blob data in the correct Run format.

    Args:
        run_id: ID of the run to fetch
        run_blob: JSON blob of run metadata and details

    Returns:
        Run object
    """
    git_data = run_blob.get("git")
    metadata = RunMetadata(
        id=ID(run_id),
        author="",
        gitBranch="",
        gitSha=git_data.get("commit_sha") if git_data else None,
        bookmark=False,
        title=run_blob["session_id"],
        notes="",
        timestamp=run_blob["session_id"],
        runCommand=run_blob["cli"]["command_path"],
        totalNodes=run_blob.get("total_nodes"),
        selectedNodes=run_blob.get("selected_nodes"),
    )
    tracking_data = get_run_tracking_data(run_id=ID(run_id))

    return Run(
        id=ID(run_id),
        metadata=metadata,
        trackingData=tracking_data,
    )


def get_run(run_id: ID) -> Run:
    """Get a run by id from the session store.

    Args:
        run_id: ID of the run to fetch

    Returns:
        Run object
    """
    session = data_access_manager.db_session
    run_data = session.query(RunModel).filter(RunModel.id == run_id).first()
    return format_run(run_data.id, json.loads(run_data.blob))


def get_runs() -> List[Run]:
    """Get all runs from the session store.

    Returns:
        list of Run objects
    """
    runs = []
    session = data_access_manager.db_session
    for run_data in session.query(RunModel).all():
        run = format_run(run_data.id, json.loads(run_data.blob))
        runs.append(run)
    return runs


def get_run_tracking_data(run_id: ID) -> RunTrackingData:
    # pylint: disable=protected-access,import-outside-toplevel
    """Get all details for a specific run. Run details contains the data from the
    tracking MetricsDataSet and JSONDataSet instances that have been logged
    during that specific `kedro run`.

    Args:
        run_id:  ID of the run to fetch the details for.

    Returns:
        RunDetails object

    """
    from kedro.extras.datasets.tracking import JSONDataSet, MetricsDataSet  # noqa: F811

    all_datasets = []
    catalog = data_access_manager.catalog.get_catalog()
    experiment_datasets = [
        (ds_name, ds_value)
        for ds_name, ds_value in catalog._data_sets.items()
        if (isinstance(ds_value, (MetricsDataSet, JSONDataSet)))
    ]
    for name, dataset in experiment_datasets:
        file_path = dataset._get_versioned_path(str(run_id))
        with dataset._fs.open(file_path, **dataset._fs_open_args_load) as fs_file:
            json_data = json.load(fs_file)
            tracking_dataset = TrackingDataSet(
                datasetName=name,
                datasetType=str(type(dataset)),
                data=json.dumps(json_data),
            )
            all_datasets.append(tracking_dataset)
    return RunTrackingData(id=run_id, trackingData=all_datasets)


@strawberry.type
class Run:
    """Run object format to return to the frontend"""

    id: ID
    metadata: Optional[RunMetadata]
    trackingData: Optional[RunTrackingData]


@strawberry.type
class RunMetadata:
    """RunMetadata object format"""

    id: ID
    title: str
    timestamp: str
    author: Optional[str]
    gitBranch: Optional[str]
    gitSha: Optional[str]
    bookmark: Optional[bool]
    notes: Optional[str]
    runCommand: Optional[str]
    totalNodes: Optional[int]
    selectedNodes: Optional[int]


@strawberry.type
class TrackingDataSet:
    """TrackingDataSet object to structure tracking data for a Run."""

    datasetName: Optional[str]
    datasetType: Optional[str]
    data: Optional[str]


@strawberry.type
class RunTrackingData:
    """RunTrackingData object format"""

    id: ID
    trackingData: Optional[List[TrackingDataSet]]


@strawberry.type
class Query:
    """Query endpoint to get data from the session store"""

    @strawberry.field
    def runs_with_data(self, run_ids: List[ID]) -> List[Run]:
        """Query to get data for specific runs from the session store"""
        runs = []
        for run_id in run_ids:
            run = get_run(run_id)
            runs.append(run)
        return runs

    runsList: List[Run] = strawberry.field(resolver=get_runs)


schema = strawberry.Schema(query=Query)

router = APIRouter()

router.add_route("/graphql", GraphQL(schema))
