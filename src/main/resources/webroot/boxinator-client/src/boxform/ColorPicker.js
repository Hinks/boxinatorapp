import React, { Component } from 'react'
import Slider from 'material-ui/Slider'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import {rgbToHex} from './colorConverter'


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
        const redSliderStyle = {width: 250}
        const greenSliderStyle = {width: 250}
        const blueSliderStyle = {width: 250}
        
        const colorIndicatorStyle = {
            backgroundColor: `rgb(${this.state.red}, ${this.state.green}, ${this.state.blue})`
        }

        return (
            <div className="colorPickerContainer">
                <p>Red</p>
                <Slider
                    min={0}
                    max={255}
                    step={5}
                    value={this.state.red}
                    onChange={this.handleSliderChange("red")}
                    sliderStyle={redSliderStyle}
                /><br />
                <p>Green</p>
                <Slider
                    min={0}
                    max={255}
                    step={5}
                    value={this.state.green}
                    onChange={this.handleSliderChange("green")}
                    style={greenSliderStyle}
                /><br />
                <p>Blue</p>
                <Slider
                    min={0}
                    max={255}
                    step={5}
                    value={this.state.blue}
                    onChange={this.handleSliderChange("blue")}
                    style={blueSliderStyle}
                />
                <TextField
                    disabled={true}
                    fullWidth={false}
                    name="indicator"
                    hintText=""
                    underlineShow={false}
                    style={colorIndicatorStyle}
                    errorText={this.props.errorText}
                    /><br />
            </div>

        )
    }
}
export default ColorPicker
