package com.boxinatorapp.boxinatorapp.database;

import com.boxinatorapp.boxinatorapp.ShippingCostUtils;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.ResultSet;

import java.util.Optional;
import java.util.function.Function;

public class DbUtils {


  public static JsonObject convertResultSetToJsonResponse(ResultSet resultSet, Function<ResultSet, JsonObject> converter){
    return converter.apply(resultSet);
  }

  public static JsonObject boxesConverter(ResultSet reslutSet){
    JsonArray boxes = reslutSet.toJson().getJsonArray("rows");
    return new JsonObject().put("boxes", boxes);
  }

  public static JsonObject statisticsAboutBoxesConverter(ResultSet resultSet){
    JsonObject rows = resultSet.toJson().getJsonArray("rows").getJsonObject(0);

    Optional<Float> totalWeight = Optional.ofNullable(rows.getFloat("TotalWeight"));
    Optional<Float> totalShippingCost = Optional.ofNullable(rows.getFloat("TotalShippingCost"));

    JsonObject stats = new JsonObject()
      .put("totalWeight", totalWeight.orElse(0f))
      .put("totalShippingCost", totalShippingCost.orElse(0f));

    return stats;
  }

  public static JsonArray convertBoxToParams(JsonObject clientJsonBox){

    Optional<String> receiver = Optional.ofNullable(clientJsonBox.getString("receiver"));
    Optional<Float> weight = Optional.ofNullable(clientJsonBox.getFloat("weight"));
    Optional<String>  color = Optional.ofNullable(clientJsonBox.getString("color"));
    Optional<String>  destinationCountry = Optional.ofNullable(clientJsonBox.getString("destinationCountry"));

    float shippingCost = ShippingCostUtils.calculateCost(
      ShippingCostUtils.countryMultipliers(),
      destinationCountry.orElse("No Valid Country"),
      weight.orElse(0f));

    JsonArray params = new JsonArray()
      .add(receiver.orElse("unknown receiver"))
      .add(weight.orElse(0f))
      .add(shippingCost)
      .add(color.orElse("0,0,0"))
      .add(destinationCountry.orElse("unknown country"));

    return params;
  }

}
