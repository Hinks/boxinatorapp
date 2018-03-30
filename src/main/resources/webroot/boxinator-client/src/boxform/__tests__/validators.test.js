import {
  validateNameOfReceiver,
  validateWeight,
  validateDestinationCountry
} from '../validators.js'
import CONSTANTS from '../../constants'
var assert = require('assert')

const emptyErrorObj = {
  errorFound: false,
  errors: {}
}

describe("Valid names should not generate an error message.", () => {

  it("Sven Svensson", () => {
    assert.deepEqual(validateNameOfReceiver("Sven Svensson", emptyErrorObj), emptyErrorObj)
  })

  it("SVEN SVENSSON", () => {
    assert.deepEqual(validateNameOfReceiver("SVEN SVENSSON", emptyErrorObj), emptyErrorObj)
  })

  it("Sven Stig Svensson", () => {
    assert.deepEqual(validateNameOfReceiver("Sven Stig Svensson", emptyErrorObj), emptyErrorObj)
  })

  it("S. Stig Svensson", () => {
    assert.deepEqual(validateNameOfReceiver("S. Stig Svensson", emptyErrorObj), emptyErrorObj)
  })

  it("Sven O'Stig Svensson", () => {
    assert.deepEqual(validateNameOfReceiver("Sven O'Stig Svensson", emptyErrorObj), emptyErrorObj)
  })
})

describe("Should be invalid names and generate an error message.", () => {
  const expectedErrorObj = {
    errorFound: true,
    errors: {
      receiverErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_NAME
    }
  }

  it("Sven57", () => {
    assert.deepEqual(validateNameOfReceiver("Sven57", emptyErrorObj), expectedErrorObj)
  })

  it("Sven_Stig_Svensson", () => {
    assert.deepEqual(validateNameOfReceiver("Sven_Stig_Svensson", emptyErrorObj), expectedErrorObj)
  })

  it("Sven.Stig@Svensson", () => {
    assert.deepEqual(validateNameOfReceiver("Sven.Stig@Svensson", emptyErrorObj), expectedErrorObj)
  })

  it("Svenne", () => {
    assert.deepEqual(validateNameOfReceiver("Svenne", emptyErrorObj), expectedErrorObj)
  })

  it("Empty String", () => {
    assert.deepEqual(validateNameOfReceiver("", emptyErrorObj), expectedErrorObj)
  })
})

describe("Valid weight should not generate an error message.", () => {

  it("0.1", () => {
    assert.deepEqual(validateWeight("0.1", emptyErrorObj), emptyErrorObj)
  })

  it("1.", () => {
    assert.deepEqual(validateWeight("1.", emptyErrorObj), emptyErrorObj)
  })

  it("1", () => {
    assert.deepEqual(validateWeight("1", emptyErrorObj), emptyErrorObj)
  })

  it(".5", () => {
    assert.deepEqual(validateWeight(".5", emptyErrorObj), emptyErrorObj)
  })
  it("+.5", () => {
    assert.deepEqual(validateWeight("+.5", emptyErrorObj), emptyErrorObj)
  })

})

describe("Invalid weight should generate an error message.", () => {
  const expectedErrorObj = {
    errorFound: true,
    errors: {
      weightErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_WEIGHT
    }
  }

  it(".", () => {
    assert.deepEqual(validateWeight(".", emptyErrorObj), expectedErrorObj)
  })

  it("1..5", () => {
    assert.deepEqual(validateWeight("1..5", emptyErrorObj), expectedErrorObj)
  })

  it("1.2.3", () => {
    assert.deepEqual(validateWeight("1.2.3", emptyErrorObj), expectedErrorObj)
  })

  it("-1", () => {
    assert.deepEqual(validateWeight("-1", emptyErrorObj), expectedErrorObj)
  })

  it("0", () => {
    assert.deepEqual(validateWeight("0", emptyErrorObj), expectedErrorObj)
  })

  it("+-1", () => {
    assert.deepEqual(validateWeight("+-1", emptyErrorObj), expectedErrorObj)
  })

  it("Empty string", () => {
    assert.deepEqual(validateWeight("", emptyErrorObj), expectedErrorObj)
  })

})

describe("Valid country should not generate an error message.(Country is case sensitive)", () => {

  it("Sweden", () => {
    assert.deepEqual(validateDestinationCountry("Sweden", CONSTANTS.SUPPORTED_COUNTRIES, emptyErrorObj), emptyErrorObj)
  })

})

describe("Invalid country should generate an error message.(Country is case sensitive)", () => {

  it("sweden", () => {
    const country = "sweden"
    const expectedErrorObj = {
      errorFound: true,
      errors: {
        destinationCountryErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_DESTINATION_COUNTRY(country)
      }
    }
    assert.deepEqual(validateDestinationCountry(country, CONSTANTS.SUPPORTED_COUNTRIES, emptyErrorObj), expectedErrorObj)
  })

  it("Denmark", () => {
    const country = "Denmark"
    const expectedErrorObj = {
      errorFound: true,
      errors: {
        destinationCountryErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_DESTINATION_COUNTRY(country)
      }
    }
    assert.deepEqual(validateDestinationCountry(country, CONSTANTS.SUPPORTED_COUNTRIES, emptyErrorObj), expectedErrorObj)
  })
})

describe("Combined validators", () => {

  it("Invalid input for all fields should generate 4 errors, one for each field.", () => {

    const box = {
      receiver: "Sven",
      weight: "-1",
      "color": "#0000",
      destinationCountry: "Denmark"
    }

    const expectedErrorObj = {
      errorFound: true,
      errors: {
        receiverErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_NAME,
        weightErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_WEIGHT,
        colorErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_RGB_COLOR,
        destinationCountryErrMsg: CONSTANTS.ERROR_MESSAGES.INVALID_DESTINATION_COUNTRY(box.destinationCountry)
      }
    }

    const val1 = validateNameOfReceiver(box.receiver, emptyErrorObj)
    const val2 = validateWeight(box.weight, val1)
    const val3 = validateDestinationCountry(box.destinationCountry, CONSTANTS.SUPPORTED_COUNTRIES, val2)
    assert.deepEqual(val3, expectedErrorObj)
  })

  it("Valid box should not generate any error messages.", () => {

    const box = {
      receiver: "Sven Svensson",
      weight: "1",
      "color": "#000000",
      destinationCountry: "Sweden"
    }
    const val1 = validateNameOfReceiver(box.receiver, emptyErrorObj)
    const val2 = validateWeight(box.weight, val1)
    const val3 = validateDestinationCountry(box.destinationCountry, CONSTANTS.SUPPORTED_COUNTRIES, val2)
    assert.deepEqual(val3, emptyErrorObj)
  })

})
