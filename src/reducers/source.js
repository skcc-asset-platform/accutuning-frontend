import {
  REFRESH_SOURCE,
  REFRESH_SOURCE_SUCCESS,
  REFRESH_SOURCE_FAILURE,
  DELETE_SOURCE_SUCCESS
} from "../actions/source";

const initialState = {
  data: null,
  error: null,
  loading: false
};

export default (state = initialState, action) => {
  // console.log(action)
  switch (action.type) {
    case REFRESH_SOURCE:
      return {
        ...state,
        loading: true
      };
    case REFRESH_SOURCE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload
      };
    case REFRESH_SOURCE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case DELETE_SOURCE_SUCCESS:
      return {
        ...state,
        data: null
      };
    default:
      return {
        ...state
      };
  }
};
