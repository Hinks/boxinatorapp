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

public class SimpleSQLOperations {

  public static <T> Future<T> simpleOperation(JDBCClient dbClient,
                                              String sqlQuery,
                                              BiFunction<JDBCClient, String, Future<T>> specifiedOperaton){

    return specifiedOperaton.apply(dbClient, sqlQuery);
  }

}