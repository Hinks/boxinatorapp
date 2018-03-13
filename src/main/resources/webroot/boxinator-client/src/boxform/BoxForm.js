import React, { Component } from 'react'
import InputField from './user-input/InputField'
import * as validators from './validators'
import hexToRgb from './colorConverter.js'
import CONSTANTS from '../constants'
import APIUtils from '../common'


class BoxForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      receiver: "",
      receiverErrMsg: "",
      weight: "0",
      weightErrMsg: "",
      color: "#000000",
      colorErrMsg: "",
      destinationCountry: "Sweden",
      destinationCountryErrMsg: ""
    }
  }

  clearForm = () => {
    this.setState({
      receiver: "",
      weight: "0",
      color: "#000000",
      destinationCountry: "Sweden"
    })
  }
  clearErrorMsgs = () => {
    this.setState({
      receiverErrMsg: "",
      weightErrMsg: "",
      colorErrMsg: "",
      destinationCountryErrMsg: ""
    })
  }

  getCurrentFormInputValues = () => {
    return {
      receiver: this.state.receiver,
      weight: this.state.weight,
      color: this.state.color,
      destinationCountry: this.state.destinationCountry
    }
  }

  handleInputChange = (event) => {
    const target = event.target
    const name = target.name
    if (this.state.hasOwnProperty(name)) {
      this.setState({
        [name]: target.value
      })
    } else {
      console.log("Pls don't modify the elements name parameter")
    }
  }

  postBoxToServer = (box) => {
    APIUtils.postBox(this.props.whichFetch, box)
      .then(res => console.log(JSON.stringify(res)))
      .catch(error => console.log(error))
  }

  handleSaveButtonClick = () => {
    this.clearErrorMsgs()

    const currentFormInputValues = this.getCurrentFormInputValues()
    const validatedFrom = this.validateFormInputFields(currentFormInputValues)

    if (!validatedFrom.errorFound) {

      const boxReadyToPost = {
        ...currentFormInputValues,
        color: hexToRgb(currentFormInputValues.color),
        weight: parseFloat(currentFormInputValues.weight)
      }

      this.postBoxToServer(boxReadyToPost)
      this.clearForm()
    }else {
      if (validatedFrom.errors.weightErrMsg) {
        this.setState({...validatedFrom.errors, weight: "0"})
      } else {
        this.setState({...validatedFrom.errors})
      }
    }
  }

  validateFormInputFields(formInputValues){
    const errorObject = { errorFound: false, errors: {} }
    const val1 = validators.validateNameOfReceiver(formInputValues.receiver, errorObject)
    const val2 = validators.validateWeight(formInputValues.weight, val1)
    const val3 = validators.validateHexColor(formInputValues.color, val2)
    const val4 = validators.validateDestinationCountry(formInputValues.destinationCountry, CONSTANTS.SUPPORTED_COUNTRIES, val3)
    return val4
  }

  render(){
    const receiver =
      <input
        name="receiver"
        type="text"
        value={this.state.receiver}
        onChange={this.handleInputChange}
       />
    const weight =
      <input
        name="weight"
        type="text"
        placeholder="0.0"
        value={this.state.weight}
        onChange={this.handleInputChange}
      />
    const color =
      <input
        name="color"
        type="color"
        value={this.state.color}
        onChange={this.handleInputChange}
      />
    const destinationCountry =
      <select
        name="destinationCountry"
        value={this.state.destinationCountry}
        onChange={this.handleInputChange}>
          <option value="Australia">Australia</option>
          <option value="Brazil">Brazil</option>
          <option value="China">China</option>
          <option value="Sweden">Sweden</option>
      </select>

    return (
      <div id="box-form">
        <InputField
          input={receiver}
          label="Full name of receiver"
          error={this.state.receiverErrMsg}
        />
        <InputField
          input={weight}
          label="Weight"
          error={this.state.weightErrMsg}
        />
        <InputField
          input={color}
          label="Box Color"
          error={this.state.colorErrMsg}
        />
        <InputField
          input={destinationCountry}
          label="Ship to Country"
          error={this.state.destinationCountryErrMsg}
        />
        <button type="button" onClick={this.handleSaveButtonClick}>Save!</button>
      </div>
    )
  }
}

export default BoxForm
