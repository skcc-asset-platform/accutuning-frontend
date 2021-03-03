import * as client from '../utils/client';
import { createAction } from '../utils/actions';
import { refreshSources } from './sources';

/* action types */
export const REFRESH_SOURCE = '@source/REFRESH_SOURCE';
export const REFRESH_SOURCE_SUCCESS = '@source/REFRESH_SOURCE_SUCCESS';
export const REFRESH_SOURCE_FAILURE = '@source/REFRESH_SOURCE_FAILURE';

const refreshSourceStart = createAction(REFRESH_SOURCE);
const refreshSourceSuccess = createAction(REFRESH_SOURCE_SUCCESS, (data) => (data));
const refreshSourceFailure = createAction(REFRESH_SOURCE_FAILURE, (error) => (error));

export function refreshSource() {
  return (dispatch) => {
    dispatch(refreshSourceStart());

    return client.get('/source/').then((data) => {
      dispatch(refreshSourceSuccess(data));
    }, (error) => {
      dispatch(refreshSourceFailure(error));
    });
  };
}

/* action types */
export const CREATE_SOURCE_FROM_SKLEARN = '@source/CREATE_SOURCE_FROM_SKLEARN';
export const CREATE_SOURCE_FROM_SKLEARN_SUCCESS = '@source/CREATE_SOURCE_FROM_SKLEARN_SUCCESS';
export const CREATE_SOURCE_FROM_SKLEARN_FAILURE = '@source/CREATE_SOURCE_FROM_SKLEARN_FAILURE';

const createSourceFromSklearnStart = createAction(CREATE_SOURCE_FROM_SKLEARN);
const createSourceFromSklearnSuccess = createAction(CREATE_SOURCE_FROM_SKLEARN_SUCCESS, (data) => (data));
const createSourceFromSklearnFailure = createAction(CREATE_SOURCE_FROM_SKLEARN_FAILURE, (error) => (error));

export function createSourceFromSklearn(datasetName) {
  return (dispatch) => {
    dispatch(createSourceFromSklearnStart());

    return client.post(`/sources/from_sklearn_dataset/`, {datasetName}).then((data) => {
      dispatch(createSourceFromSklearnSuccess(data));
      dispatch(refreshSources())
    //   dispatch(refreshRuntimes())
    }, (error) => {
      dispatch(createSourceFromSklearnFailure(error));
    });
  };
}


/* action types */
export const DELETE_SOURCE = '@source/DELETE_SOURCE';
export const DELETE_SOURCE_SUCCESS = '@source/DELETE_SOURCE_SUCCESS';
export const DELETE_SOURCE_FAILURE = '@source/DELETE_SOURCE_FAILURE';

const deleteSourceStart = createAction(DELETE_SOURCE);
const deleteSourceSuccess = createAction(DELETE_SOURCE_SUCCESS, (data) => (data));
const deleteSourceFailure = createAction(DELETE_SOURCE_FAILURE, (error) => (error));

export function deleteSource(param) {
  return (dispatch) => {
    dispatch(deleteSourceStart());

    return client.del(`/sources/`).then((data) => {
      dispatch(deleteSourceSuccess(data));
      dispatch(refreshSource())
    }, (error) => {
      dispatch(deleteSourceFailure(error));
    });
  };
}
