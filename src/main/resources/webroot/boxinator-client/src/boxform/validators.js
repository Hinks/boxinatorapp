import CONSTANTS from '../constants'

const ERROR_MESSAGES = CONSTANTS.ERROR_MESSAGES

export function validateNameOfReceiver(state){

  const regex = /^[a-z\u00C0-\u02AB'´`]+\.?\s([a-z\u00C0-\u02AB'´`]+\.?\s?)+$/i
  const isValidName = (name) => name.match(regex) != null

  if (!isValidName(state.receiver)) {
    return {...state, receiverErrMsg: ERROR_MESSAGES.INVALID_NAME}
  }else {
    return state
  }
}

export function validateWeight(state){

  const regex = /^[+]?([1-9][0-9]*(?:[\.][0-9]*)?|0*\.0*[1-9][0-9]*)?$/
  const isValidWeight = (number) => (number === "") ? false : number.match(regex) != null

  if (!isValidWeight(state.weight)) {

    return {...state, weightErrMsg: ERROR_MESSAGES.INVALID_WEIGHT}

  } else {
      return state
  }
}

export function validateDestinationCountry(countries){

    return function(state){

      const isValidCountry = (country, countries) => countries.includes(country)
      if (!isValidCountry(state.destinationCountry, countries)) {
        
        return {...state, destinationCountryErrMsg: ERROR_MESSAGES.INVALID_DESTINATION_COUNTRY(state.destinationCountry)}
      
      }else {
        return state
      }
  }

}