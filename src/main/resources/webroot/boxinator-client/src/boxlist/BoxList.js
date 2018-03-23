import React, { Component } from 'react'
import {connect} from 'react-redux'
import {BoxItem} from './BoxItem'
import APIUtils from '../common'

class BoxList extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    const suppliedFetchFn = this.props.whichFetch

    APIUtils.getBoxes(suppliedFetchFn)
     .then(data => {
       this.props.dispatch({type: "FETCH_BOXES_FULFILLED", payload: data})
     })
     .catch(error => {
       this.props.dispatch({type: "FETCH_BOXES_REJECTED", payload: error})
     })

    APIUtils.getStatisticsAboutBoxes(suppliedFetchFn)
      .then(data => {
        this.props.dispatch({type: "FETCH_STATISTICS_ABOUT_BOXES_FULFILLED", payload: data})
      })
      .catch(error => {
        this.props.dispatch({type: "FETCH_STATISTICS_ABOUT_BOXES_REJECTED", payload: error})
      })
  }

  render() {
    const {boxes, totalShippingCost, totalWeight} = this.props
    const boxItems = (boxes.lenght < 1) ? null : (boxes.map(box => <BoxItem key={box.Id} {...box}/>))

    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Receiver</th>
              <th>Weight</th>
              <th>Box color</th>
              <th>ShippingCost</th>
            </tr>
            {boxItems}
          </tbody>
        </table>
        <br></br>
        <p>Total shipping cost: {totalShippingCost} SEK</p>
        <p>Total weight: {totalWeight} kilograms</p>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    boxes: state.boxesReducer.boxes,
    totalShippingCost: state.statisticsAboutBoxesReducer.totalShippingCost,
    totalWeight: state.statisticsAboutBoxesReducer.totalWeight,
    boxesError: state.boxesReducer.boxesError,
    statisticsAboutBoxesError: state.statisticsAboutBoxesReducer.statisticsAboutBoxesError

  }
}
export default connect(mapStateToProps)(BoxList);
