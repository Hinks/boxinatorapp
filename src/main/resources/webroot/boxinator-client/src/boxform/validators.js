import CONSTANTS from '../constants'

export function validateNameOfReceiver(state){

  const regex = /^[a-z\u00C0-\u02AB'´`]+\.?\s([a-z\u00C0-\u02AB'´`]+\.?\s?)+$/i
  const isValidName = (name) => name.match(regex) != null

  if (!isValidName(state.receiver)) {
    return {...state, receiverErrMsg: CONSTANTS.ERROR_MESSAGES.invalidName}
  }else {
    return state
  }
}

export function validateWeight(state){

  const regex = /^[+]?([1-9][0-9]*(?:[\.][0-9]*)?|0*\.0*[1-9][0-9]*)?$/
  const isValidWeight = (number) => (number === "") ? false : number.match(regex) != null

  if (!isValidWeight(state.weight)) {

    return {...state, weightErrMsg: CONSTANTS.ERROR_MESSAGES.invalidWeight}

  } else {
      return state
  }
}

export function validateDestinationCountry(state, countries){

  const isValidCountry = (country, countries) => countries.includes(country)

  if (!isValidCountry(state.destinationCountry, countries)) {
    
    return {...state, destinationCountryErrMsg: CONSTANTS.ERROR_MESSAGES.invalidDestinationCountry(state.destinationCountry)}
  
  }else {
    return state
  }
}