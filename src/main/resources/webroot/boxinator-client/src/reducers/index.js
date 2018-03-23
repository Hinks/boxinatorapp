import { combineReducers } from 'redux'
import {boxesReducer, statisticsAboutBoxesReducer} from './boxesReducer'

export default combineReducers({
  boxesReducer, statisticsAboutBoxesReducer
})
