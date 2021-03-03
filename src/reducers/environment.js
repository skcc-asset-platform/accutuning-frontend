import {
    REFRESH_FIELDS,
    REFRESH_FIELDS_SUCCESS,
    REFRESH_FIELDS_FAILURE,
} from "../actions/environment";
  
  const initialState = {
    data: null,
    error: null,
    loading: false
  };
  
  export default (state = initialState, action) => {
    // console.log(action)
    switch (action.type) {
      case REFRESH_FIELDS:
        return {
          ...state,
          loading: true
        };
      case REFRESH_FIELDS_SUCCESS:
        return {
          ...state,
          loading: false,
          error: null,
          data: action.payload
        };
      case REFRESH_FIELDS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      default:
        return {
          ...state
        };
    }
  };
  