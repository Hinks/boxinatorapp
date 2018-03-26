import React, { Component } from 'react'
import * as validators from './validators'
import CONSTANTS from '../constants'
import APIUtils from '../common'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import ColorPicker from './ColorPicker'
import './stylesheets/box-form.css'


class BoxForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      receiver: "",
      receiverErrMsg: "",
      weight: "",
      weightErrMsg: "",
      rgbColor: {red: 0, green: 0, blue: 0},
      rgbColorErrMsg: "",
      destinationCountry: "Sweden",
      destinationCountryErrMsg: ""
    }
  }

  clearForm = () => {
    this.setState({
      receiver: "",
      weight: "0",
      rgbColor: {red: 0, green: 0, blue: 0},
      destinationCountry: "Sweden"
    })
  }
  clearErrorMsgs = () => {
    this.setState({
      receiverErrMsg: "",
      weightErrMsg: "",
      rgbColorErrMsg: "",
      destinationCountryErrMsg: ""
    })
  }

  getCurrentFormInputValues = () => {
    return {
      receiver: this.state.receiver,
      weight: this.state.weight,
      rgbColor: this.state.rgbColor,
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

  handleColorChange = (rgbColor) => {
    this.setState({
      rgbColor: {...rgbColor}
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

      const {red, green, blue} = {...currentFormInputValues.rgbColor}
      
      const boxReadyToPost = {
        ...currentFormInputValues,
        color: `${red},${green},${blue}`,
        weight: parseFloat(currentFormInputValues.weight)
      }

      this.postBoxToServer(boxReadyToPost)
      this.clearForm()
    }else {
      if (validatedFrom.errors.weightErrMsg) {
        this.setState({...validatedFrom.errors})
      } else {
        this.setState({...validatedFrom.errors})
      }
    }
  }

  validateFormInputFields(formInputValues){
    const errorObject = { errorFound: false, errors: {} }
    const val1 = validators.validateNameOfReceiver(formInputValues.receiver, errorObject)
    const val2 = validators.validateWeight(formInputValues.weight, val1)
    const val3 = validators.validateDestinationCountry(formInputValues.destinationCountry, CONSTANTS.SUPPORTED_COUNTRIES, val2)
    return val3
  }

  render(){

    return (
      <div className="box-form-container">

      <TextField
        name="receiver"
        onChange={this.handleInputChange}
        value={this.state.receiver}
        errorText={this.state.receiverErrMsg}
        floatingLabelText="Full name of receiver"
        hintText="first and sur name"
        fullWidth={true}
      /><br />

      <TextField
        name="weight"
        onChange={this.handleInputChange}
        value={this.state.weight}
        errorText={this.state.weightErrMsg}
        floatingLabelText="Weight"
        hintText="in kilograms"
        fullWidth={true}
      /><br />

      <SelectField
          floatingLabelText="Destination Country"
          fullWidth={true}
          value={this.state.destinationCountry}
          name="destinationCountry"
          onChange={(event, index, value) => this.setState({destinationCountry: value})}
        >
          <MenuItem value={"Australia"} primaryText="Australia" />
          <MenuItem value={"Brazil"} primaryText="Brazil" />
          <MenuItem value={"China"} primaryText="China" />
          <MenuItem value={"Sweden"} primaryText="Sweden" />
        </SelectField><br />

      <ColorPicker
        onColorChange={this.handleColorChange}
        errorText={this.state.rgbColorErrMsg}
      /><br />

      <RaisedButton 
        label="Save!" 
        onClick={this.handleSaveButtonClick}
        primary={true} 
        fullWidth={true}
        />
      
      </div>
    )
  }
}

export default BoxForm
