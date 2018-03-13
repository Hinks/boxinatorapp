export default function reducer(state={
    boxes: [],
    totalShippingCost: 0,
    totalWeight: 0,
    error: null
  }, action){

    switch (action.type) {
      case "FETCH_BOXES_REJECTED":
          return {...state, error: action.payload}
      case "FETCH_BOXES_FULFILLED":
        return {
          ...state,
          boxes: action.payload.boxes,
          totalShippingCost: action.payload.totalShippingCost,
          totalWeight: action.payload.totalWeight,
          error: null
        }
      default:
        return state
    }
  }
