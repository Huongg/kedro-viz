import { getUrl } from '../utils';
import loadJsonData from '../store/load-data';

/**
 * Toggle whether to display the loading spinner when a run is triggered
 * @param {boolean} loading True if runis still loading
 */
export const TOGGLE_RUN_LOADING = 'TOGGLE_RUN_LOADING';
export function toggleRunLoading(loading) {
  return {
    type: TOGGLE_RUN_LOADING,
    loading,
  };
}

/**
 * Determine where to load data from
 * @param {object} pipeline Pipeline state
 */
export const getRunUrl = (query) => {
  return getUrl('kedrorun', query);
};

/**
 * Change pipeline on selection, loading new data if necessary
 * @param {string} pipelineID Unique ID for new pipeline
 * @return {function} A promise that resolves when the data is loaded
 */
export function toggleKedroRun() {
  return async function (dispatch, getState) {
    console.log(getState());
    const { runConfig } = getState();
    console.log('runConfig', runConfig);
    const { features, targetVariables, modelClass, modelEvaluators } =
      runConfig;

    // we need to stitch the queries from the state here
    const query = `features:${features.toString()}, targetVariables:${targetVariables}, modelClass:${modelClass}, modelEvaluators:${modelEvaluators}`;

    dispatch(toggleRunLoading(true));

    const url = getRunUrl(query);

    await loadJsonData(url).then((data) => {
      console.log('data', data);
      dispatch(toggleRunLoading(false));
    });
  };
}
