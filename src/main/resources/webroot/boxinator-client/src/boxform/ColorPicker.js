import React, { Component } from 'react'
import Slider from 'material-ui/Slider'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import {rgbToHex} from './colorConverter'
import './stylesheets/color-picker.css'


class ColorPicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            red: 0,
            green: 0,
            blue: 0
        }
    }

    handleSliderChange = name => (event, newValue) => {
        this.setState({
            [name]: newValue
        })
        const {red, green, blue} = {...this.state}
        this.props.onColorChange(rgbToHex(red, green, blue))
    }

    render() {

        const colorIndicatorStyle = {
            backgroundColor: `rgb(${this.state.red}, ${this.state.green}, ${this.state.blue})`,
            height: "50%",
            marginTop: 20,
            marginBottom: 0,
        }

        const style = {
            marginBottom: "0px",
            marginTop: "0px"
        }
        const errorTextStyle = {
            marginBottom: -2,
            padding: "10px 0px",
            backgroundColor: "white"
        }
        return (
            <div className="color-picker-container">
                <h3>Box color</h3>
                <Slider
                    className="color-slider"
                    min={0}
                    max={255}
                    step={10}
                    value={this.state.red}
                    onChange={this.handleSliderChange("red")}
                    sliderStyle={style}
                /><br />
                <Slider
                    min={0}
                    max={255}
                    step={10}
                    value={this.state.green}
                    onChange={this.handleSliderChange("green")}
                    sliderStyle={style}
                /><br />
                <Slider
                    min={0}
                    max={255}
                    step={10}
                    value={this.state.blue}
                    onChange={this.handleSliderChange("blue")}
                    sliderStyle={style}
                />
                <TextField
                    disabled={true}
                    fullWidth={true}
                    name="indicator"
                    hintText=""
                    underlineShow={false}
                    style={colorIndicatorStyle}
                    errorText={this.props.errorText}
                    errorStyle={errorTextStyle}
                /><br />
            </div>

        )
    }
}
export default ColorPicker
