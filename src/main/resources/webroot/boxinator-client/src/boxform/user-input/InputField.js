import React from 'react'

function InputField(props){
  return (
    <div className="input-field-div">
      <label>{props.label}</label>
      <br></br>
      {props.input}
      {(props.error) ? <p className="input-error-msg">{props.error}</p> : null}
    </div>
  )
}

export default InputField
