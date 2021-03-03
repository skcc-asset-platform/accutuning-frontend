import * as client from '../utils/client';
import { createAction } from '../utils/actions';

/* action types */
export const GET_SITE = '@source/GET_SITE';
export const GET_SITE_SUCCESS = '@source/GET_SITE_SUCCESS';
export const GET_SITE_FAILURE = '@source/GET_SITE_FAILURE';

const getSiteStart = createAction(GET_SITE);
const getSiteSuccess = createAction(GET_SITE_SUCCESS, (data) => (data));
const getSiteFailure = createAction(GET_SITE_FAILURE, (error) => (error));

export function getSite(data) {
  return (dispatch) => {
    dispatch(getSiteStart());

    return client.get('/info/vars/', data).then((resp) => {
      dispatch(getSiteSuccess(resp));
    }, (error) => {
      dispatch(getSiteFailure(error));
    });
  };
}
