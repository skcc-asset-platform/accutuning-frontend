import * as client from '../utils/client';
import { createAction } from '../utils/actions';
import { getCurrentUser } from './user';
// import { httpLink } from '../index'

/* action types */
export const LOGIN_USER = '@source/LOGIN_USER';
export const LOGIN_USER_SUCCESS = '@source/LOGIN_USER_SUCCESS';
export const LOGIN_USER_FAILURE = '@source/LOGIN_USER_FAILURE';

const loginUserStart = createAction(LOGIN_USER);
const loginUserSuccess = createAction(LOGIN_USER_SUCCESS, (data) => (data));
const loginUserFailure = createAction(LOGIN_USER_FAILURE, (error) => (error));

export function loginUser(data) {
  return (dispatch) => {
    dispatch(loginUserStart());

    return client.post('/token-auth/', data).then((resp) => {
      dispatch(loginUserSuccess(resp));
      dispatch(getCurrentUser())
      // console.log(httpLink)
    }, (error) => {
      dispatch(loginUserFailure(error));
    });
  };
}


/* action types */
export const LOGOUT_USER = '@source/LOGOUT_USER';
export const LOGOUT_USER_SUCCESS = '@source/LOGOUT_USER_SUCCESS';
export const LOGOUT_USER_FAILURE = '@source/LOGOUT_USER_FAILURE';

// const logoutUserStart = createAction(LOGOUT_USER);
const logoutUserSuccess = createAction(LOGOUT_USER_SUCCESS, (data) => (data));
// const logoutUserFailure = createAction(LOGOUT_USER_FAILURE, (error) => (error));

export function logoutUser(data) {
  return (dispatch) => {
    dispatch(logoutUserSuccess());

    // dispatch(logoutUserStart());

    // return client.post('/token-auth/', data).then((resp) => {
    //   dispatch(logoutUserSuccess(resp));
    //   dispatch(getCurrentUser())
    //   console.log(httpLink)
    // }, (error) => {
    //   dispatch(logoutUserFailure(error));
    // });
  };
}


/* action types */
export const CHANGE_PASSWORD = '@source/CHANGE_PASSWORD';
export const CHANGE_PASSWORD_SUCCESS = '@source/CHANGE_PASSWORD_SUCCESS';
export const CHANGE_PASSWORD_FAILURE = '@source/CHANGE_PASSWORD_FAILURE';

const changePasswordStart = createAction(CHANGE_PASSWORD);
const changePasswordSuccess = createAction(CHANGE_PASSWORD_SUCCESS, (data) => (data));
const changePasswordFailure = createAction(CHANGE_PASSWORD_FAILURE, (error) => (error));

export function changePassword(data) {
  return (dispatch) => {
    dispatch(changePasswordStart());
    return client.post('/change-password/', data).then((resp) => {
      dispatch(changePasswordSuccess(resp));
      dispatch(getCurrentUser())
    }, (error) => {
      dispatch(changePasswordFailure(error));
    });
  };
}
