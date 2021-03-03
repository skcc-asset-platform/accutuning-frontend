import {
    REFRESH_WORKSPACE,
    REFRESH_WORKSPACE_SUCCESS,
    REFRESH_WORKSPACE_FAILURE,
    LOAD_FROM_WORKSPACE,
    LOAD_FROM_WORKSPACE_SUCCESS,
    LOAD_FROM_WORKSPACE_FAILURE,
    FILE_UPLOAD,
    FILE_UPLOAD_SUCCESS,
    FILE_UPLOAD_FAILURE,
  } from "../actions/workspace";
  
  const initialState = {
    data: null,
    error: null,
    loading: false,
    startUpload: false,
    startUploadFileName: null,
    errorUpload: false,
    successUpload: false,
  };
  
  export default (state = initialState, action) => {
    // console.log(action)
    switch (action.type) {
      case REFRESH_WORKSPACE:
        return {
          ...state,
          loading: true,
        };
      case REFRESH_WORKSPACE_SUCCESS:
        return {
          ...state,
          loading: false,
          error: null,
          data: action.payload,
        };
      case REFRESH_WORKSPACE_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        }
      case LOAD_FROM_WORKSPACE:
        return {
          ...state,
          loadingFromWorkspace: true,
        }
      case LOAD_FROM_WORKSPACE_SUCCESS:
        return {
          ...state,
          loadingFromWorkspace: false,
          dataFromWorkspace: action.payload,
          errorFromWorkspace: null,
        }
      case LOAD_FROM_WORKSPACE_FAILURE:
        return {
          ...state,
          loadingFromWorkspace: false,
          dataFromWorkspace: null,
          errorFromWorkspace: action.payload,
        }
      case FILE_UPLOAD:
        return {
          ...state,
          startUpload: true,
          startUploadFileName: action.payload,
          errorUpload: false,
          successUpload: false,
        }
      case FILE_UPLOAD_SUCCESS:
        return {
          ...state,
          startUpload: false,
          errorUpload: false,
          successUpload: true,
        }
      case FILE_UPLOAD_FAILURE:
        return {
          ...state,
          startUpload: false,
          errorUpload: true,
          successUpload: false,
        }
      default:
        return {
          ...state
        }
    }
  };
  