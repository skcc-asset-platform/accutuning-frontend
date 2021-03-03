import * as client from '../utils/client';
import { createAction } from '../utils/actions';


/* action types */
export const REFRESH_SOURCES = '@sources/REFRESH_SOURCES';
export const REFRESH_SOURCES_SUCCESS = '@sources/REFRESH_SOURCES_SUCCESS';
export const REFRESH_SOURCES_FAILURE = '@sources/REFRESH_SOURCES_FAILURE';

const refreshSourcesStart = createAction(REFRESH_SOURCES);
const refreshSourcesSuccess = createAction(REFRESH_SOURCES_SUCCESS, (data) => (data));
const refreshSourcesFailure = createAction(REFRESH_SOURCES_FAILURE, (error) => (error));

export function refreshSources() {
  return (dispatch) => {
    dispatch(refreshSourcesStart());

    return client.get('/sources/').then((data) => {
      dispatch(refreshSourcesSuccess(data));
    }, (error) => {
      dispatch(refreshSourcesFailure(error));
    });
  };
}


/* action types */
export const EXPERIMENT_SOURCE = '@sources/EXPERIMENT_SOURCE';
export const EXPERIMENT_SOURCE_SUCCESS = '@sources/EXPERIMENT_SOURCE_SUCCESS';
export const EXPERIMENT_SOURCE_FAILURE = '@sources/EXPERIMENT_SOURCE_FAILURE';

const experimentSourceStart = createAction(EXPERIMENT_SOURCE);
// const experimentSourceSuccess = createAction(EXPERIMENT_SOURCE_SUCCESS, (data) => (data));
const experimentSourceFailure = createAction(EXPERIMENT_SOURCE_FAILURE, (error) => (error));

export function experimentSource(id, refreshExperiments) {
  return (dispatch) => {
    dispatch(experimentSourceStart());

    return client.post(`/sources/${id}/experiment/`).then((data) => {
      refreshExperiments()
      // dispatch(refreshExperiments())
      // dispatch(refreshDatasetSuccess(data));
    }, (error) => {
      dispatch(experimentSourceFailure(error));
    });
  };
}


/* action types */
export const PARSE_SOURCE = '@sources/PARSE_SOURCE';
export const PARSE_SOURCE_SUCCESS = '@sources/PARSE_SOURCE_SUCCESS';
export const PARSE_SOURCE_FAILURE = '@sources/PARSE_SOURCE_FAILURE';

const parseSourceStart = createAction(PARSE_SOURCE);
// const parseSourceSuccess = createAction(PARSE_SOURCE_SUCCESS, (data) => (data));
const parseSourceFailure = createAction(PARSE_SOURCE_FAILURE, (error) => (error));

export function parseSource(id) {
  return (dispatch) => {
    dispatch(parseSourceStart());

    return client.post(`/sources/${id}/parse/`).then((data) => {
    //   dispatch(refreshExperiments())
    }, (error) => {
      dispatch(parseSourceFailure(error));
    });
  };
}


/* action types */
export const DELETE_SOURCE = '@sources/DELETE_SOURCE';
export const DELETE_SOURCE_SUCCESS = '@sources/DELETE_SOURCE_SUCCESS';
export const DELETE_SOURCE_FAILURE = '@sources/DELETE_SOURCE_FAILURE';

const deleteSourceStart = createAction(DELETE_SOURCE);
// const deleteSourceSuccess = createAction(DELETE_SOURCE_SUCCESS, (data) => (data));
const deleteSourceFailure = createAction(DELETE_SOURCE_FAILURE, (error) => (error));

export function deleteSource(id) {
  return (dispatch) => {
    dispatch(deleteSourceStart());

    return client.del(`/sources/${id}/`).then((data) => {
      dispatch(refreshSources())
    }, (error) => {
      dispatch(deleteSourceFailure(error));
    });
  };
}
