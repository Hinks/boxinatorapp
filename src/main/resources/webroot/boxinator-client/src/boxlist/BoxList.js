import React, { Component } from 'react'
import {connect} from 'react-redux'
import {BoxItem} from './BoxItem'
import APIUtils from '../common'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

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
    
    const boxList = (boxes.lenght < 1) ? null : (boxes.map(box => <BoxItem box={box}/>))

    return (
      <div>
          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn style={{fontSize: 24}}>Receiver </TableHeaderColumn>
                <TableHeaderColumn style={{fontSize: 24}}>Weight</TableHeaderColumn>
                <TableHeaderColumn style={{fontSize: 24}}>Color</TableHeaderColumn>
                <TableHeaderColumn style={{fontSize: 24}}>Shipping cost</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {boxList}
            </TableBody>
          </Table>
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
