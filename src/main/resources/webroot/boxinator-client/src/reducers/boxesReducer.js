export function boxesReducer(state={
  boxes: [],
  boxesError: null
}, action){

  switch (action.type) {
    case "FETCH_BOXES_REJECTED":
        return {...state, boxesError: action.payload}
    case "FETCH_BOXES_FULFILLED":
      return {
        ...state,
        boxes: action.payload.boxes,
        boxesError: null
      }
    default:
      return state
  }
}

export function statisticsAboutBoxesReducer(state={
  totalShippingCost: 0,
  totalWeight: 0,
  statisticsAboutBoxesError: null
}, action) {
  switch (action.type) {
    case "FETCH_STATISTICS_ABOUT_BOXES_REJECTED":
        return {...state, statisticsAboutBoxesError: action.payload}
    case "FETCH_STATISTICS_ABOUT_BOXES_FULFILLED":
      return {
        ...state,
        totalShippingCost: action.payload.totalShippingCost,
        totalWeight: action.payload.totalWeight,
        statisticsAboutBoxesError: null
      }
    default:
      return state
  }
}
