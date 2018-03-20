package com.boxinatorapp.boxinatorapp.database;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.UpdateResult;

import java.util.Optional;

public class DbOperations {

  public static Future<JsonObject> fetchBoxes(JDBCClient dbClient, String query){
    Future<ResultSet> f1 = Future.future();
    dbClient.query(query, f1);
    return f1
      .compose(resultSet -> {
        JsonArray boxes = resultSet.toJson().getJsonArray("rows");
        return Future.succeededFuture(new JsonObject().put("boxes", boxes));
      });

  }

  public static Future<JsonObject> fetchStatisticsAboutBoxes(JDBCClient dbClient, String query){
    Future<ResultSet> f1 = Future.future();
    dbClient.query(query, f1);
    return f1
      .compose(resultSet -> {
        JsonObject rows = resultSet.toJson().getJsonArray("rows").getJsonObject(0);

        Optional<Float> totalWeight = Optional.ofNullable(rows.getFloat("TotalWeight"));
        Optional<Float> totalShippingCost = Optional.ofNullable(rows.getFloat("TotalShippingCost"));

        JsonObject stats = new JsonObject()
          .put("totalWeight", totalWeight.orElse(0f))
          .put("totalShippingCost", totalShippingCost.orElse(0f));

        return Future.succeededFuture(stats);
      });

  }

  public static Future<JsonObject> saveBox(JDBCClient dbClient, String query, JsonArray params){
    Future<UpdateResult> f1 = Future.future();
    dbClient.updateWithParams(query, params, f1);
    return f1
      .compose(updateResult -> Future.succeededFuture(new JsonObject().put("saveBoxRequest", "ok")))
      .otherwise(new JsonObject().put("saveBoxRequest", "failed"));
  }

}