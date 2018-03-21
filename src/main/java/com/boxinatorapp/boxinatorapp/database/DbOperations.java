package com.boxinatorapp.boxinatorapp.database;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.UpdateResult;

import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Function;

public class DbOperations {

  public static Function<JDBCClient, Function<String, Future<ResultSet>>> dbQuerier =
    dbClient ->
      sqlQuery -> Future.future(handler -> dbClient.query(sqlQuery, handler));

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