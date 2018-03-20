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

    Future<JsonObject> f1 = Future.future();
    Future<ResultSet> f2 = Future.future(handler -> dbClient.query(query, handler));

    f2.setHandler(arResultSet -> {

      if (arResultSet.succeeded()){

        JsonArray boxes = arResultSet.result().toJson().getJsonArray("rows");
        f1.complete(new JsonObject().put("boxes", boxes));

      }else {
        f1.fail(arResultSet.cause());
      }

    });

    return f1;
  }

  public static Future<JsonObject> fetchStatisticsAboutBoxes(JDBCClient dbClient, String query){

    Future<JsonObject> f1 = Future.future();
    Future<ResultSet> f2 = Future.future(handler -> dbClient.query(query, handler));

    f2.setHandler(arResultSet -> {

      if (arResultSet.succeeded()){

        JsonObject rows = arResultSet.result().toJson().getJsonArray("rows").getJsonObject(0);

        Optional<Float> totalWeight = Optional.ofNullable(rows.getFloat("TotalWeight"));
        Optional<Float> totalShippingCost = Optional.ofNullable(rows.getFloat("TotalShippingCost"));

        JsonObject stats = new JsonObject()
          .put("totalWeight", totalWeight.orElse(0f))
          .put("totalShippingCost", totalShippingCost.orElse(0f));

        f1.complete(stats);

      }else {
        f1.fail(arResultSet.cause());
      }

    });

    return f1;
  }

  public static Future<JsonObject> saveBox(JDBCClient dbClient, String query, JsonArray params){

    Future<JsonObject> f1 = Future.future();
    Future<UpdateResult> f2 = Future.future(handler -> dbClient.updateWithParams(query, params, handler));

    f2.setHandler(arUpdateResult -> {

      if (arUpdateResult.succeeded()){
        f1.complete(new JsonObject().put("saveBoxRequest", "ok"));
      }else {
        f1.fail(arUpdateResult.cause());
      }

    });

    return f1;
  }

}