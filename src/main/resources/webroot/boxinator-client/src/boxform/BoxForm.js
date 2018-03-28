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

  getDefaultStateValues() {
    return {
      receiver: "",
      weight: "0",
      rgbColor: {red: 0, green: 0, blue: 0},
      destinationCountry: "Sweden"
    }
  }

  getStateWithErrMsgsCleared(obj) {

    const mapper = ([key, val]) => {
      if(key.includes("ErrMsg")){
        return { [key]: "" }
      }else{
        return { [key]: val }
      }
    }

    return Object.assign(...Object.entries(obj).map(mapper));
  }

  handleInputChange = (event) => {
    const target = event.target
    const name = target.name
    this.setState({
      [name]: target.value
    })
  }

  handleColorChange = (oneColorVal) => {
    const newColorVal = {...this.state.rgbColor, ...oneColorVal}
    this.setState({
      rgbColor: newColorVal
    })
  }

  postBoxToServer = (box) => {
    APIUtils.postBox(this.props.whichFetch, box)
      .then(res => console.log(JSON.stringify(res)))
      .catch(error => console.log(error))
  }

  handleSaveButtonClick = () => {

    const validatedState = this.validateState(this.getStateWithErrMsgsCleared(this.state))

    if (!this.stateContainsError(validatedState)) {

      const {red, green, blue} = {...validatedState.rgbColor}
      
      const boxReadyToPost = {
        receiver: validatedState.receiver,
        weight: parseFloat(validatedState.weight),
        color: `${red},${green},${blue}`,
        destinationCountry: validatedState.destinationCountry
      }

      this.postBoxToServer(boxReadyToPost)
      this.setState({...this.getStateWithErrMsgsCleared(validatedState), ...this.getDefaultStateValues()})
    }else {
      this.setState({...validatedState})
    }
  }

  stateContainsError(currentState) {
    const errors = currentState.receiverErrMsg
      .concat(currentState.weightErrMsg)
      .concat(currentState.destinationCountryErrMsg)

    return (errors.length > 0)
  }

  validateState(currentState){
    const val1 = validators.validateNameOfReceiver(currentState)
    const val2 = validators.validateWeight(val1)
    const val3 = validators.validateDestinationCountry(val2, CONSTANTS.SUPPORTED_COUNTRIES)
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
