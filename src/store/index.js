import { createStore } from 'redux';
import reducer from '../reducers';
import { resetData, updateFontLoaded } from '../actions';
import getInitialState from './initial-state';
import loadData from './load-data';
import { saveState } from './helpers';
import checkFontLoaded from '../utils/check-font-loaded';

export default function configureStore(props) {
  /**
   * Dispatch an action to update the store with new pipeline data
   * @param {Object} normalizedData Normalised state data
   */
  const resetStoreData = normalizedData => {
    if (store) {
      store.dispatch(resetData(normalizedData));
    }
  };

  const pipelineData = loadData(props.data, resetStoreData);
  const initialState = getInitialState(pipelineData, props);

  const store = createStore(reducer, initialState);

  store.subscribe(() => {
    const { textLabels, theme, typeDisabled } = store.getState();
    saveState({ textLabels, theme, typeDisabled });
  });

  checkFontLoaded().then(() => {
    store.dispatch(updateFontLoaded(true));
  });

  return store;
}
