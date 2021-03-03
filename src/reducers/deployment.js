import * as client from '../utils/client';
import { createAction } from '../utils/actions';

/* action types */
export const REFRESH_DEPLOYMENT = '@deployment/REFRESH_DEPLOYMENT';
export const REFRESH_DEPLOYMENT_SUCCESS = '@deployment/REFRESH_DEPLOYMENT_SUCCESS';
export const REFRESH_DEPLOYMENT_FAILURE = '@deployment/REFRESH_DEPLOYMENT_FAILURE';

const refreshDeploymentStart = createAction(REFRESH_DEPLOYMENT);
const refreshDeploymentSuccess = createAction(REFRESH_DEPLOYMENT_SUCCESS, (data) => (data));
const refreshDeploymentFailure = createAction(REFRESH_DEPLOYMENT_FAILURE, (error) => (error));

export function refreshDeployment(pk) {
    return (dispatch) => {
      dispatch(refreshDeploymentStart());

      return client.get(`/experiments/${pk}/deployment/`).then((data) => {
        dispatch(refreshDeploymentSuccess(data));
      }, (error) => {
        dispatch(refreshDeploymentFailure(error));
      });
    };
  }
