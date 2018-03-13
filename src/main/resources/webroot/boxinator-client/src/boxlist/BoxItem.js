import React from 'react'

export function BoxItem(props){
  return (
    <tr>
      <td className="name-column">{props.Receiver}</td>
      <td className="weight-column">{props.Weight} kilograms</td>
      <td style={{backgroundColor:`rgb(${props.Color})`}}></td>
      <td>{props.ShippingCost} SEK</td>
    </tr>
  )
}
