import React, { useState, useEffect } from 'react';
import * as client from './client';
import { connect } from 'react-redux';
import { toast } from "react-toastify"

const InputCheckbox = (props) => {
  return (
      <input
          checked={props.checked}
          type='checkbox'
          {...props} />
  )
};


const CheckboxFieldSingleUpdater = ({showLabel, update, field, value, path, options, helptext, disabled}) => {
  const [checked, setChecked] = useState(value)
  const toggle = () => {
    // console.log(eventValue, value)
    update({ [field]: !checked })
        .then((e) => setChecked(!checked))
        .catch((e) => {
          toast.error(`정상적으로 수행되지 않았습니다. message: ${String(e)}`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });          
        })
  }

  useEffect(() => {
    setChecked(value)
  }, [value])

  return (<div className={disabled ? "wrap_check disabled" : "wrap_check"}>
    <InputCheckbox
      disabled={disabled}
      checked={checked}
      onChange={(e) => toggle()}
      className="inp_check modal_check"
      name={field}
      id={path + field}
      type='checkbox' />
    <label className="label_check" htmlFor={path + field}>
      <span className="ico_automl ico_check"></span>
      {/* {checked ? 'Yes' : 'No'} */}
      { showLabel ? field : null }
    </label>
    {/* <span color="gray">{helptext}</span> */}
  </div>)
}

const CheckboxFieldUpdater = ({update, field, value, options, helptext, disabled}) => {
  const [checked, setChecked] = useState(options.map(option => {
    return (value && value.length > 0) ? value.includes(option) : false
  }))
  useEffect(() => {
    setChecked(
        options.map(option => {
          return (value && value.length > 0) ? value.includes(option) : false
        })
    )
  }, [field, value, options])
  const setCheckedIndex = (idx, e) => {
    // console.log(idx, e.target.value);
    const filteredOptions = [];
    const results = checked.map((chk, chkIdx) => {
      if (chkIdx === idx) {
        chk = !chk;
      }

      if (chk) {
        filteredOptions.push(options[chkIdx])
      }
      return chk;
    })
    update({ [field]: JSON.stringify(filteredOptions) })
        .then(() => setChecked(results))
        .catch((e) => {
          toast.error(`정상적으로 수행되지 않았습니다. message: ${String(e)}`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });          
        })
  }

  return options.map(
        (option, idx) => (
          <div className="wrap_check" key={option}>
            <InputCheckbox
              id={option}
              disabled={disabled}
              checked={checked[idx]}
              className="inp_check modal_check"
              onChange={(e) => setCheckedIndex(idx, e)}
              />
            <label className="label_check" htmlFor={option}>
              <span className="ico_automl ico_check"></span>
              {/* {checked ? 'Yes' : 'No'} */}
              {checked[idx] ? <u>{option}</u> : option}
            </label>
                {/* {idx === options.length - 1 ? helptext : null} */}
          </div>
      ))
}

const SelectboxFieldUpdater = ({showLabel, update, field, value, options, allowNull, helptext, disabled}) => {
  const [selectValue, setSelectValue] = useState(value)
  // const [error, setError] = useState(null)
  useEffect(() => {
    setSelectValue(value)
  }, [value])

  const selectComp = <select
      className="form-control"
      // isInvalid={error !== null}
      value={selectValue === null || selectValue === undefined ? '' : selectValue}
      disabled={disabled}
      onChange={(e) => {
        const newValue = e.target.value || '';
        update({ [field]: newValue === '' ? null : newValue })
            .then(() => {setSelectValue(newValue)})
            .catch((e) => {
              // setError(e);
              // console.log(e);
              toast.error(`정상적으로 수행되지 않았습니다. message: ${String(e)}`, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });              
            })
      }}>
    {allowNull ? <option value=''>----</option> : null}
    {options.map(
        option => <option key={option} value={option}>{String(option)}</option>
    )}
  </select>

  return <div className={disabled ? "wrap_select disabled" : "wrap_select"}>
    {selectComp}
  </div>
  // return showLabel ? (
  //     <span>
  //         <span>{field}:</span>
  //       {selectComp}
  //       <span color="gray">{helptext}</span>
  //         </span>
  // ) : selectComp;
}

// const DateTimePickerUpdater = ({showLabel, update, field, value, disabled}) => {
//   const [selectValue, setSelectValue] = useState(value)
//   return <div>
//    {showLabel ? `${field} -> ` : null}
//    <DateTimePicker
//     disabled={disabled}
//     onChange={(newValue) => {
//       update({ [field]: newValue }).then(() => {setSelectValue(newValue)}).catch((e) => { console.log(e); alert(e) })
//     }}
//     value={new Date(selectValue)}
//   />
//   </div>
// }

const TextUpdater = ({showLabel, update, field, value, helptext, disabled}) => {
  const [selectValue, setSelectValue] = useState(value)
  return <div className="type_inline">
    {showLabel ? <span>{field}:</span> : null}
    <input className="inp_txt"
        disabled={disabled}
        onChange={(e) => {setSelectValue(e.target.value)}}
        value={selectValue}
    />
    <button className="btn_m" onClick={() => {
      update({ [field]: selectValue }).then(
        () => {
          toast.success(`저장되었습니다.`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      ).catch((e) => { 
        // console.log(e); alert(e)
        toast.error(`정상적으로 수행되지 않았습니다. message: ${String(e)}`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });        
      })
    }}>save</button>
    {helptext}
    </div>
}


const mapStateToProps = (state) => {
  return ({
    fieldsMeta: state.environment.data,
  })
};

export default connect(mapStateToProps)(({ fieldsMeta, path, field, type, disabled, onLoad, value, allowNull, showLabel=true, options = [] }) => {
  const update = (data) => {
    setUpdating(true);
    return client.patch(path, data).then(
        (resp) => onLoad ? onLoad(resp) : null
    ).finally(
        () => setUpdating(false)
    )
  }

  const [updating, setUpdating] = useState(false);
  const fieldDisable = disabled || updating
  const fieldMeta = fieldsMeta ? fieldsMeta.find(f => f.name === field) : null;
  const helpText = fieldMeta ? <span className='helptext'>{fieldMeta.helptext}</span> : null;

  if (options.length === 0 && fieldMeta && fieldMeta.choices && fieldMeta.choices.length > 0) {
    options = fieldMeta.choices
  }

  if (!type && fieldMeta) {
    if (fieldMeta.boolean) {
      // type = 'checkbox'
      // console.log(options)
    }
    else if (fieldMeta.choices > 0) {
      type = 'selectbox'
    }
  }

  if (type === 'checkbox' && options.length > 0) {
    return <CheckboxFieldUpdater
        update={update}
        field={field}
        value={value}
        options={options}
        helptext={helpText}
        disabled={fieldDisable}/>

  }
  else if (type === 'checkbox') {
    return <CheckboxFieldSingleUpdater
        update={update}
        field={field}
        value={value}
        path={path}
        showLabel={showLabel}
        helptext={helpText}
        disabled={fieldDisable}/>

  }
  // else if (type === 'datetimepicker') {
  //   return <DateTimePickerUpdater
  //   showLabel={showLabel}
  //   update={update}
  //   field={field}
  //   value={value} disabled={fieldDisable}/>
  // }
  else if (type === 'text') {
    return <TextUpdater showLabel={showLabel}
                        update={update}
                        field={field}
                        value={value}
                        helptext={helpText}
                        disabled={fieldDisable}/>

  }
  else {
    return <SelectboxFieldUpdater
        showLabel={showLabel}
        update={update}
        field={field}
        value={value}
        helptext={helpText}
        options={options}
        allowNull={allowNull}
        disabled={fieldDisable}/>

  }
})