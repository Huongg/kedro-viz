import { TOGGLE_GRAPH_LOADING } from '../actions/graph';
import { TOGGLE_PIPELINE_LOADING } from '../actions/pipelines';
import { TOGGLE_NODE_DATA_LOADING } from '../actions/nodes';
import { TOGGLE_RUN_LOADING } from '../actions/kedro-run';

function loadingReducer(loadingState = {}, action) {
  switch (action.type) {
    case TOGGLE_PIPELINE_LOADING: {
      return Object.assign({}, loadingState, {
        pipeline: action.loading,
      });
    }

    case TOGGLE_GRAPH_LOADING: {
      return Object.assign({}, loadingState, {
        graph: action.loading,
      });
    }

    case TOGGLE_NODE_DATA_LOADING: {
      return Object.assign({}, loadingState, {
        node: action.loading,
      });
    }

    case TOGGLE_RUN_LOADING: {
      return Object.assign({}, loadingState, {
        run: action.loading,
      });
    }

    default:
      return loadingState;
  }
}

export default loadingReducer;
