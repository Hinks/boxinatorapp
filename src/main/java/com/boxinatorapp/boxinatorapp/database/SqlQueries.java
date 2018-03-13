package com.boxinatorapp.boxinatorapp.database;

public class SqlQueries {

  public static final String CREATE_BOX_TABLE = "" +
    "CREATE TABLE if not exists Box (" +
    "  Id int(11) unsigned auto_increment primary key not null," +
    "  Receiver varchar(30) not null," +
    "  Weight float(10, 3) not null," +
    "  ShippingCost float(13, 2) not null," +
    "  Color varchar(11) not null," +
    "  DestinationCountry varchar(30) not null" +
    ");";

  public static final String ALL_BOXES = "SELECT Id,Receiver,Weight,Color,ShippingCost FROM Box;";

  public static final String SAVE_BOX = "" +
    "INSERT into Box(Receiver, Weight, ShippingCost, Color, DestinationCountry)" +
    "VALUES(?, ?, ?, ?, ?);";

  public static final String STATS = "SELECT SUM(Weight) as TotalWeight, SUM(ShippingCost) as TotalShippingCost FROM Box;";

  public static final String RESET_TABLE = "truncate Box;";

}
