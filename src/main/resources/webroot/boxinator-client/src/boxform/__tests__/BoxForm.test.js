import React from 'react'
import BoxForm from '../BoxForm'
import InputField from '../user-input/InputField'
import CONSTANTS from "../../constants"
import {shallow} from 'enzyme'
import { mount } from 'enzyme';
var assert = require('assert')


describe("<BoxForm />", () => {


  it("should render four <InputField /> components", () => {
    const wrapper = shallow(<BoxForm />);
    assert.equal(wrapper.find(InputField).length, 4)
  })


  it("should render a button", () => {
    const wrapper = shallow(<BoxForm />);
    assert.equal(wrapper.find("button").length, 1)
  })


  it("default state is correct", () => {
    const wrapper = shallow(<BoxForm />);
    const defaultState = {
      receiver: "",
      receiverErrMsg: "",
      weight: "0",
      weightErrMsg: "",
      color: '#000000',
      colorErrMsg: "",
      destinationCountry: 'Sweden',
      destinationCountryErrMsg: ""
    }
    assert.deepEqual(wrapper.state(), defaultState)
  })


  it("Should generate two error messages in the components state if just clicking the save button.", () => {
    const wrapper = shallow(<BoxForm />);
    wrapper.find('button').simulate('click');
    const expectedState = {
      receiver: "",
      receiverErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_NAME,
      weight: "0",
      weightErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_WEIGHT,
      color: '#000000',
      colorErrMsg: "",
      destinationCountry: 'Sweden',
      destinationCountryErrMsg: ""
    }
    assert.deepEqual(wrapper.state(), expectedState)
  })


  it("should render two <p class=\"input-error-msg\"> if just clicking the save button.", () => {
    const wrapper = mount(<BoxForm />);
    wrapper.find('button').simulate('click')
    wrapper.update()
    const numberOfErrorMessages = wrapper.find(InputField).find('p.input-error-msg').length
    assert.equal(numberOfErrorMessages, 2)
    wrapper.unmount()
  })


  it("The BoxForm component's state should reset after saving a valid box.", () => {
    /* The BoxForm component will reset it's state after clicking the save
    * button for a valid box via the clearErrorMsgs() and clearForm() functions.
    * The component doesn't reset it's state depending on the received
    * response from the server if the box was successfully inserted or not.
    * Because of this, the fakefetch doesn't really do anything.
    */
    const defaultState = {
      receiver: "",
      receiverErrMsg: "",
      weight: "0",
      weightErrMsg: "",
      color: '#000000',
      colorErrMsg: "",
      destinationCountry: 'Sweden',
      destinationCountryErrMsg: ""
    }

    const validBox = {
      receiver: "Sven Svensson",
      receiverErrMsg: "",
      weight: "1",
      weightErrMsg: "",
      color: '#000000',
      colorErrMsg: "",
      destinationCountry: 'Sweden',
      destinationCountryErrMsg: ""
    }

    const fakeFetch = (url, init) => {
      return new Promise(function(resolve){})
    }

    const wrapper = mount(<BoxForm whichFetch={fakeFetch}/>);
    wrapper.setState({...validBox})
    assert.deepEqual(wrapper.state(), validBox)

    wrapper.find('button').simulate('click')

    assert.deepEqual(wrapper.state(), defaultState)
    wrapper.unmount()
  })

})
