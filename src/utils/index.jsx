import React from 'react'
import FieldUpdater from './FieldUpdater'
import { Grid } from "@material-ui/core";
import { toast } from 'react-toastify';

export function toastError(content, options){
  return toast.error(String(content), {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
   ...options
  })
}

export function toastSuccess(content, options){
    return toast.success(String(content), {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
     ...options
    })
}
  
export const Heading = (props) => (
    <div className="area_tit">
        <h3 className="tit_table">{props.children}</h3>
    </div>
)

export const SubHeading = (props) => (
    <div className='help-text help-tab'>
        {props.children}
    </div>
)

export const ModalContent = (props) => (
    <div className="modal-content">{props.children}</div>
)

export const ModalHeader = (props) => (
    <div className="header_popup">
        <strong className="tit_popup">{props.title}</strong>
        {props.children}
    </div>
)

export const ModalBody = (props) => (
    <div className="body_popup">{props.children}</div>
)

export const FieldUpdaterWrapper = (props) => (
    // <div className="item_dl type_inline">
    //     <dt>{props.children}</dt>
    //     <dd><FieldUpdater {...props}/></dd>
    // </div>
    // <Grid container spacing={3}>
    <>
        <Grid item xs={4}>{props.children}</Grid>
        <Grid item xs={8}><FieldUpdater {...props}/></Grid>
    </>
)