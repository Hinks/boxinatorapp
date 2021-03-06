import React, { Component } from 'react'
import Slider from 'material-ui/Slider'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import './stylesheets/color-picker.css'


class ColorPicker extends Component {
    constructor(props) {
        super(props)
    }

    handleSliderChange = name => (event, newValue) => {
        this.props.onColorChange({[name]: newValue})
    }

    render() {

        const colorIndicatorStyle = {
            backgroundColor: `rgb(${this.props.red}, ${this.props.green}, ${this.props.blue})`,
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
                    value={this.props.red}
                    onChange={this.handleSliderChange("red")}
                    sliderStyle={style}
                /><br />
                <Slider
                    min={0}
                    max={255}
                    step={10}
                    value={this.props.green}
                    onChange={this.handleSliderChange("green")}
                    sliderStyle={style}
                /><br />
                <Slider
                    min={0}
                    max={255}
                    step={10}
                    value={this.props.blue}
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
