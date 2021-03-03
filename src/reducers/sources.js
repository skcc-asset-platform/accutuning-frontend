import {
  REFRESH_SOURCES,
  REFRESH_SOURCES_SUCCESS,
  REFRESH_SOURCES_FAILURE,
  PARSE_SOURCE,
  PARSE_SOURCE_SUCCESS,
  PARSE_SOURCE_FAILURE,
} from "../actions/sources";

const initialState = {
  data: null,
  error: null,
  loading: false
};

export default (state = initialState, action) => {
  // console.log(action)
  switch (action.type) {
    case REFRESH_SOURCES:
      return {
        ...state,
        loading: true
      };
    case REFRESH_SOURCES_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload
      };
    case REFRESH_SOURCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case PARSE_SOURCE:
    case PARSE_SOURCE_SUCCESS:
    case PARSE_SOURCE_FAILURE:
    default:
      return {
        ...state
      };
  }
};
