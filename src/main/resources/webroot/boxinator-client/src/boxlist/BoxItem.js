import React from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'

function ReceiverColumn(props){
  return (
    <TableRowColumn>{props.Receiver}</TableRowColumn>
  )
}

function WeightColumn(props){

  return (
    <TableRowColumn>{props.Weight}</TableRowColumn>
  )
}

function ColorColumn(props){
  const style = {
    backgroundColor:`rgb(${props.Color})`
  }
  return (
    <TableRowColumn style={style}></TableRowColumn>
  )
}

function ShippingCostColumn(props){
  return (
    <TableRowColumn>{props.ShippingCost} SEK</TableRowColumn>
  )
}


export function BoxItem(props){
  const {Id, Receiver, Weight, Color, ShippingCost} = {...props.box}

  return (
    <TableRow key={Id}>
      <ReceiverColumn Receiver={Receiver}/>
      <WeightColumn Weight={Weight}/>
      <ColorColumn Color={Color}/>
      <ShippingCostColumn ShippingCost={ShippingCost}/>
    </TableRow>
  )
}
