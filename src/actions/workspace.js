import * as client from '../utils/client';
import { createAction } from '../utils/actions';
import { refreshSources } from './sources';
import { toastError } from '../utils';
import i18n from "i18next";


/* action types */
export const REFRESH_WORKSPACE = '@workspace/REFRESH_WORKSPACE';
export const REFRESH_WORKSPACE_SUCCESS = '@workspace/REFRESH_WORKSPACE_SUCCESS';
export const REFRESH_WORKSPACE_FAILURE = '@workspace/REFRESH_WORKSPACE_FAILURE';

const refreshWorkspaceStart = createAction(REFRESH_WORKSPACE);
const refreshWorkspaceSuccess = createAction(REFRESH_WORKSPACE_SUCCESS, (data) => (data));
const refreshWorkspaceFailure = createAction(REFRESH_WORKSPACE_FAILURE, (error) => (error));

export function refreshWorkspace() {
    return (dispatch) => {
      dispatch(refreshWorkspaceStart());
  
      return client.get('/sources/workspace_files/').then((data) => {
        dispatch(refreshWorkspaceSuccess(data));
      }, (error) => {
        dispatch(refreshWorkspaceFailure(error));
      });
    };
}

export const LOAD_FROM_WORKSPACE = '@workspace/LOAD_FROM_WORKSPACE';
export const LOAD_FROM_WORKSPACE_SUCCESS = '@workspace/LOAD_FROM_WORKSPACE_SUCCESS';
export const LOAD_FROM_WORKSPACE_FAILURE = '@workspace/LOAD_FROM_WORKSPACE_FAILURE';

const loadFromWorkspaceStart = createAction(LOAD_FROM_WORKSPACE);
const loadFromWorkspaceSuccess = createAction(LOAD_FROM_WORKSPACE_SUCCESS, (data) => (data));
// const loadFromWorkspaceFailure = createAction(LOAD_FROM_WORKSPACE_FAILURE, (error) => (error));

export function loadFromWorkspace(obj) {
  return (dispatch) => {
    dispatch(loadFromWorkspaceStart());

    return client.post('/sources/from_workspace/', obj).then((data) => {
      dispatch(loadFromWorkspaceSuccess(data));
      dispatch(refreshSources())
      // dispatch(refreshRuntimes())
      // dispatch(refreshSource());
      // dispatch(refreshDataset());
      // dispatch(refreshColumns());
    });
  };
}

export const FILE_UPLOAD = '@workspace/FILE_UPLOAD';
export const FILE_UPLOAD_SUCCESS = '@workspace/FILE_UPLOAD_SUCCESS';
export const FILE_UPLOAD_FAILURE = '@workspace/FILE_UPLOAD_FAILURE';

const fileUploadStart = createAction(FILE_UPLOAD, (data) => (data));
const fileUploadSuccess = createAction(FILE_UPLOAD_SUCCESS, (data) => (data));
const fileUploadFailure = createAction(FILE_UPLOAD_FAILURE, (error) => (error));

export function fileUpload(file) {
  return (dispatch) => {
    dispatch(fileUploadStart(file.name));
    const formData = new FormData();
    formData.append('fileData', file, file.name);
    console.log(file, formData)
    return client.filepost('/sources/workspace_files/', formData).then((data) => {

      if(data.status === 400 || data.status === 401){
        toastError(i18n.t('invalid file extension'));
        dispatch(fileUploadFailure("invalid file extension"));
      }else{
        dispatch(fileUploadSuccess(data));
        dispatch(refreshWorkspace());
      }
    //   dispatch(refreshSources())
    //   dispatch(refreshRuntimes())
    }, (error) => {
      dispatch(fileUploadFailure(error));
    });
  }
}