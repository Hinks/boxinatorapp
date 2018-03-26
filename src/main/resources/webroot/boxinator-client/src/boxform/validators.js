import CONSTANTS from '../constants'

export function validateNameOfReceiver(receiver, errorObject){

  const regex = /^[a-z\u00C0-\u02AB'´`]+\.?\s([a-z\u00C0-\u02AB'´`]+\.?\s?)+$/i
  const isValidName = (name) => name.match(regex) != null

  if (!isValidName(receiver)) {
    const errorObjectCopy = deepCopy(errorObject)
    errorObjectCopy.errorFound = true
    errorObjectCopy.errors.receiverErrMsg = CONSTANTS.ERROR_MESSAGES.invalidName
    return errorObjectCopy
  }else {
    return errorObject
  }
}

export function validateWeight(weight, errorObject){

  const regex = /^[+]?([1-9][0-9]*(?:[\.][0-9]*)?|0*\.0*[1-9][0-9]*)?$/
  const isValidWeight = (number) => (number === "") ? false : number.match(regex) != null

  if (!isValidWeight(weight)) {

    const errorObjectCopy = deepCopy(errorObject)
    errorObjectCopy.errorFound = true
    errorObjectCopy.errors.weightErrMsg = CONSTANTS.ERROR_MESSAGES.invalidWeight
    return errorObjectCopy

  } else {
      return errorObject
  }
}

export function validateDestinationCountry(destinationCountry, countries, errorObject){

  const isValidCountry = (country, countries) => countries.includes(country)

  if (!isValidCountry(destinationCountry, countries)) {
    const errorObjectCopy = deepCopy(errorObject)
    errorObjectCopy.errorFound = true
    errorObjectCopy.errors.destinationCountryErrMsg = CONSTANTS.ERROR_MESSAGES.invalidDestinationCountry(destinationCountry)
    return errorObjectCopy
  }else {
    return errorObject
  }
}

function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj))
}
