import * as client from '../utils/client';
import { createAction } from '../utils/actions';

/* action types */
export const GET_CURRENT_USER = '@source/GET_CURRENT_USER';
export const GET_CURRENT_USER_SUCCESS = '@source/GET_CURRENT_USER_SUCCESS';
export const GET_CURRENT_USER_FAILURE = '@source/GET_CURRENT_USER_FAILURE';

const getCurrentUserStart = createAction(GET_CURRENT_USER);
const getCurrentUserSuccess = createAction(GET_CURRENT_USER_SUCCESS, (data) => (data));
const getCurrentUserFailure = createAction(GET_CURRENT_USER_FAILURE, (error) => (error));

export function getCurrentUser() {
  return (dispatch) => {
    dispatch(getCurrentUserStart());

    return client.post('/graphql', {query: `query {
      loginUser {
        id
        username
        isSuperuser
        groups {
          id
        }
        userPermissions {
          id
          codename
          name
        }
      }
    }`}).then((data) => {
      dispatch(getCurrentUserSuccess(data.data.loginUser));
    }, (error) => {
      dispatch(getCurrentUserFailure(error));
    });
  };
}
