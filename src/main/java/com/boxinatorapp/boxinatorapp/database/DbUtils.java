package com.boxinatorapp.boxinatorapp.database;

import com.boxinatorapp.boxinatorapp.ShippingCostUtils;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.Optional;

public class DbUtils {

  public static JsonArray convertClientBoxToJsonArray(JsonObject clientJsonBox){

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
