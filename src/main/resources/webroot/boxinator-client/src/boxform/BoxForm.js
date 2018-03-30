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

  defaultStateValues() {
    return {
      receiver: "",
      weight: "0",
      rgbColor: {red: 0, green: 0, blue: 0},
      destinationCountry: "Sweden"
    }
  }

  stateWithClearedErrMsgs(obj) {

    const mapper = errMsgSuffix => ([key, val]) => {
      if(key.includes(errMsgSuffix)){
        return { [key]: "" }
      }else{
        return { [key]: val }
      }
    }

    return Object.assign(...Object.entries(obj).map(mapper("ErrMsg")));
  }

  handleTextInputChange = (event) => {
    const target = event.target
    const name = target.name
    this.setState({
      [name]: target.value
    })
  }

  handleColorChange = (newAdditivePrimaryColor) => {
    const newRgbColor = {...this.state.rgbColor, ...newAdditivePrimaryColor}
    this.setState({
      rgbColor: newRgbColor
    })
  }

  handleDestinationCountryChange = (event, index, value) => {
    this.setState({
      destinationCountry: value
    })
  }

  postBoxToServer = (box) => {
    APIUtils.postBox(this.props.whichFetch, box)
      .then(res => console.log(JSON.stringify(res)))
      .catch(error => console.log(error))
  }

  handleSaveButtonClick = () => {

    const validatedState = this.validateState(this.stateWithClearedErrMsgs(this.state))

    if (!this.stateContainsError(validatedState)) {

      const {red, green, blue} = {...validatedState.rgbColor}
      
      const boxReadyToPost = {
        receiver: validatedState.receiver,
        weight: parseFloat(validatedState.weight),
        color: `${red},${green},${blue}`,
        destinationCountry: validatedState.destinationCountry
      }

      this.postBoxToServer(boxReadyToPost)
      this.setState({...this.stateWithClearedErrMsgs(validatedState), ...this.defaultStateValues()})
    }else {
      this.setState({...validatedState})
    }
  }

  stateContainsError(currentState) {

    const matcher = errMsgSuffix => ([key, val]) => key.includes(errMsgSuffix)
    const reducer = ( accum, [key, val] ) => accum.concat(val);

    const concatenatedErrors = Object.entries(currentState)
      .filter(matcher("ErrMsg"))
      .reduce(reducer, "")

    return (concatenatedErrors.length > 0)
  }

  validateState(currentState) {
    const validatorList = [
      validators.validateNameOfReceiver,
      validators.validateWeight,
      validators.validateDestinationCountry(CONSTANTS.SUPPORTED_COUNTRIES)
    ]

    const validatedState = validatorList.reduce( (accumState, fn) => fn(accumState), currentState)

    return validatedState
  }

  render(){

    return (
      <div className="box-form-container">

      <TextField
        name="receiver"
        onChange={this.handleTextInputChange}
        value={this.state.receiver}
        errorText={this.state.receiverErrMsg}
        floatingLabelText="Full name of receiver"
        hintText="first and sur name"
        fullWidth={true}
      /><br />

      <TextField
        name="weight"
        onChange={this.handleTextInputChange}
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
          onChange={this.handleDestinationCountryChange}
        >
          <MenuItem value={"Australia"} primaryText="Australia" />
          <MenuItem value={"Brazil"} primaryText="Brazil" />
          <MenuItem value={"China"} primaryText="China" />
          <MenuItem value={"Sweden"} primaryText="Sweden" />
        </SelectField><br />

      <ColorPicker
        red={this.state.rgbColor.red}
        green={this.state.rgbColor.green}
        blue={this.state.rgbColor.blue}
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
