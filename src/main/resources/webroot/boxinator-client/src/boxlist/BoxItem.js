import React from 'react'
import {TableRow, TableRowColumn} from 'material-ui/Table'

function ReceiverColumn(props){
  return (
    <TableRowColumn><p>{props.Receiver}</p></TableRowColumn>
  )
}

function WeightColumn(props){

  return (
    <TableRowColumn><p> {props.Weight} kg</p></TableRowColumn>
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
    <TableRowColumn><p>{props.ShippingCost} SEK</p></TableRowColumn>
  )
}


export function BoxItem(props){
  const {Receiver, Weight, Color, ShippingCost} = {...props.box}

  return (
    <TableRow>
      <ReceiverColumn Receiver={Receiver}/>
      <WeightColumn Weight={Weight}/>
      <ColorColumn Color={Color}/>
      <ShippingCostColumn ShippingCost={ShippingCost}/>
    </TableRow>
  )
}
