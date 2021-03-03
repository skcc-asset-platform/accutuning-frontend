import * as client from "../utils/client";
import { createAction } from "../utils/actions";

/* action types */
export const REFRESH_FIELDS = "@environment/REFRESH_FIELDS";
export const REFRESH_FIELDS_SUCCESS = "@environment/REFRESH_FIELDS_SUCCESS";
export const REFRESH_FIELDS_FAILURE = "@environment/REFRESH_FIELDS_FAILURE";

const refreshFieldsStart = createAction(REFRESH_FIELDS);
const refreshFieldsSuccess = createAction(REFRESH_FIELDS_SUCCESS, data => data);
const refreshFieldsFailure = createAction(
  REFRESH_FIELDS_FAILURE,
  error => error
);

export function refreshFields() {
  return dispatch => {
    dispatch(refreshFieldsStart());

    return client.get("/info/fields/").then(
      data => {
        dispatch(refreshFieldsSuccess(data));
      },
      error => {
        dispatch(refreshFieldsFailure(error));
      }
    );
  };
}
