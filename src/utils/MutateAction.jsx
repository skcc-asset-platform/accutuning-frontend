/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
// import Spinner from './Spinner'
import * as client from './client';
import { toast } from "react-toastify"

export default (props) => {
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(props.disabled);

  const mutate = (e) => {
    e.stopPropagation()
    setLoading(true);
    // setError(null)
    setDisable(props.disabled || props.disableAfterClick);

    props.onBeforeRequest && props.onBeforeRequest()
    const data = props.builddata ? props.builddata() : props.data

    client[props.verb](props.path, data).then(
      (resp) => props.onLoad ? props.onLoad(resp) : null
    ).catch(
      (e) => {
        // setError(e);
        if (props.onError) {
          props.onError(e)
        }
        toast.error(`정상적으로 수행되지 않았습니다. message: ${String(e)}`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    ).finally(
      () => {
        if (props.loadingforever) {}
        else {
          setLoading(false)
        }
      }
    )
  }

  let msg = null;
  let spinner = null;
  if (loading) { spinner =  '*' }
  // if (error) {
  //   msg = <span style={{color: 'red'}}>!{String(error)}</span>;
  // }
  if(props.div) {
    return <div disabled={disable || loading} onClick={mutate}  {...props}>
    {props.children}{spinner} {msg}
  </div> }

  return <button disabled={disable || loading} onClick={mutate}  {...props}>
    {props.children}{spinner} {msg}
  </button>
}
