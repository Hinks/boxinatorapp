import React, { Component } from 'react'
import * as validators from './validators'
import {hexToRgb} from './colorConverter.js'
import CONSTANTS from '../constants'
import APIUtils from '../common'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import ColorPicker from './ColorPicker'

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
    this.setState({
      [name]: target.value
    })
  }

  handleColorChange = (hexValue) => {
    this.setState({
      color: hexValue
    })
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

    const style = {
      margin: 12,
    };

    return (
      <div>

      <TextField
        name="receiver"
        onChange={this.handleInputChange}
        value={this.state.receiver}
        errorText={this.state.receiverErrMsg}
        floatingLabelText="Full name of receiver"
        hintText="first and sur name"
      /><br />

      <TextField
        name="weight"
        onChange={this.handleInputChange}
        value={this.state.weight}
        errorText={this.state.weightErrMsg}
        floatingLabelText="Weight"
        hintText="in kilograms"
      /><br />

      <ColorPicker
        onColorChange={this.handleColorChange}
        errorText={this.state.colorErrMsg}
      /><br />

      <SelectField
          floatingLabelText="Destination Country"
          value={this.state.destinationCountry}
          name="destinationCountry"
          onChange={(event, index, value) => this.setState({destinationCountry: value})}
        >
          <MenuItem value={"Australia"} primaryText="Australia" />
          <MenuItem value={"Brazil"} primaryText="Brazil" />
          <MenuItem value={"China"} primaryText="China" />
          <MenuItem value={"Sweden"} primaryText="Sweden" />
        </SelectField><br />

      <RaisedButton 
        label="Save!" 
        onClick={this.handleSaveButtonClick}
        primary={true} 
        style={style}/>
      
      </div>
    )
  }
}

export default BoxForm
