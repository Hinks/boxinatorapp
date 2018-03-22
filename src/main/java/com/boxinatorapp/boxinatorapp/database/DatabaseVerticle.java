package com.boxinatorapp.boxinatorapp.database;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.sql.UpdateResult;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;
import java.util.function.BiFunction;

public class DatabaseVerticle extends AbstractVerticle {

  private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseVerticle.class);
  public static final String CONFIG_MYSQL_JDBC_URL = "mysql.jdbc.url";
  public static final String CONFIG_MYSQL_JDBC_DRIVER_CLASS = "mysql.jdbc.driver_class";
  public static final String CONFIG_BOXINATORDB_QUEUE = "boxinatordb.queue";
  private JDBCClient dbClient;
  Map<SqlQuery, String> sqlQueries;

  public enum ErrorCodes {
    NO_ACTION_SPECIFIED,
    BAD_ACTION,
    DB_ERROR
  }

  @Override
  public void start(Future<Void> startFuture) throws Exception {

    //(blocking operation), but file size is small.
    Properties mysqlProps = getMySQLProperties("mysql.properties");
    sqlQueries = loadSqlQueries("db-queries.properties");

    dbClient = JDBCClient.createShared(vertx, new JsonObject()
      .put("url", config().getString(CONFIG_MYSQL_JDBC_URL, "jdbc:mysql://localhost/boxinatordb?useSSL=false"))
      .put("driver_class", config().getString(CONFIG_MYSQL_JDBC_DRIVER_CLASS, "com.mysql.cj.jdbc.Driver"))
      .put("user", mysqlProps.getProperty("user"))
      .put("password", mysqlProps.getProperty("password")));

    Future<SQLConnection> prepareDatabase = Future.future(handler -> dbClient.getConnection(handler));
    prepareDatabase
      .compose(this::createBoxTableIfNotExists)
      .compose(this::resetBoxTableIfUsingTestDB)
      .compose(this::closeConn)
      .setHandler(v -> {
        if(v.succeeded()){
          vertx.eventBus().consumer(config().getString(CONFIG_BOXINATORDB_QUEUE, "boxinatordb.queue"), this::onMessage);
          startFuture.complete();
        }else {
          LOGGER.error(v.cause());
          startFuture.fail(v.cause());
        }
      });

  }

  private Future<SQLConnection> createBoxTableIfNotExists(SQLConnection conn){
    Future<Void> f1 = Future.future();
    conn.execute(sqlQueries.get(SqlQuery.CREATE_BOX_TABLE), f1);
    return f1.compose(h -> Future.succeededFuture(conn));
  }

  private Future<SQLConnection> resetBoxTableIfUsingTestDB(SQLConnection conn){
    Future<Void> f1 = Future.future();
    boolean testModeIsEnabledInVertxConfig = config().getBoolean("testMode", false);

    if (testModeIsEnabledInVertxConfig){
      conn.execute(sqlQueries.get(SqlQuery.RESET_BOX_TABLE), f1);
    }else {
      f1.complete();
    }

    return f1.compose(v -> Future.succeededFuture(conn));
  }

  private Future<Void> closeConn(SQLConnection conn){
    return Future.future(handler -> conn.close(handler));
  }



  private void reportQueryError(Message<JsonObject> message, Throwable cause) {
    LOGGER.error("Database query error", cause);
    message.fail(ErrorCodes.DB_ERROR.ordinal(), cause.getMessage());

  }

  public void onMessage(Message<JsonObject> message) {

    if (!message.headers().contains("action")) {
      LOGGER.error("No action header specified for message with headers {} and body {}",
        message.headers(), message.body().encodePrettily());
      message.fail(ErrorCodes.NO_ACTION_SPECIFIED.ordinal(), "No action header specified");
      return;
    }

    String action = message.headers().get("action");

    switch (action) {
      case "all-boxes":
        fetchBoxesHandler(dbClient, message);
        break;
      case "stats-boxes":
        fetchStatsAboutBoxesHandler(dbClient, message);
        break;
      case "save-box":
        saveBoxHandler(dbClient, message);
        break;
      default:
        message.fail(ErrorCodes.BAD_ACTION.ordinal(), "Bad action: " + action);
    }
  }

  private void fetchBoxesHandler(JDBCClient dbClient, Message message){

    String allBoxesQuery = sqlQueries.get(SqlQuery.ALL_BOXES);

    BiFunction<JDBCClient, String, Future<ResultSet>> simpleSQLQuery =
      (theDbClient, theQuery) ->
        Future.future(handler -> theDbClient.query(theQuery, handler));

    SimpleSQLOperations.simpleOperation(dbClient, allBoxesQuery, simpleSQLQuery)
      .setHandler(arResultSet -> {

        if (arResultSet.succeeded()){

          JsonObject response = DbUtils.toDesiredJsonRes(arResultSet.result(), DbUtils::boxesResSetToJson);
          message.reply(response);

        }else {
          reportQueryError(message, arResultSet.cause());
        }

      });
  }

  private void fetchStatsAboutBoxesHandler(JDBCClient dbClient, Message<JsonObject> message) {

    String statsQuery = sqlQueries.get(SqlQuery.STATISTICS_ABOUT_BOXES);

    BiFunction<JDBCClient, String, Future<ResultSet>> simpleSQLQuery =
      (theDbClient, theQuery) ->
        Future.future(handler -> theDbClient.query(theQuery, handler));

    SimpleSQLOperations.simpleOperation(dbClient, statsQuery, simpleSQLQuery)
      .setHandler(arResultSet -> {

        if (arResultSet.succeeded()){

          JsonObject response = DbUtils.toDesiredJsonRes(arResultSet.result(), DbUtils::statsBoxesResSetToJson);
          message.reply(response);

        }else {
          reportQueryError(message, arResultSet.cause());
        }

    });
  }

  private void saveBoxHandler(JDBCClient dbClient, Message<JsonObject> message){

    String saveBoxQuery = sqlQueries.get(SqlQuery.SAVE_BOX);

    JsonObject clientJsonBox = message.body().getJsonObject("clientJsonBox");
    JsonArray params = DbUtils.convertClientBoxToJsonArray(clientJsonBox);

    BiFunction<JDBCClient, String, Future<UpdateResult>> simpleUpdateWithParamsQuery =
      (theDbClient, theQuery) ->
        Future.future(handler -> theDbClient.updateWithParams(theQuery, params, handler));

    SimpleSQLOperations.simpleOperation(dbClient, saveBoxQuery, simpleUpdateWithParamsQuery)
      .setHandler(arUpdateResult -> {

        if (arUpdateResult.succeeded()){
          message.reply(new JsonObject().put("saveBoxRequest", "ok"));
        }else {
          reportQueryError(message, arUpdateResult.cause());
        }

      });
  }

  private Properties getMySQLProperties(String fileName) throws IOException {
    InputStream mysqlPropsInputStream = getClass().getResourceAsStream("/"+fileName);
    Properties mysqlProps = new Properties();
    mysqlProps.load(mysqlPropsInputStream);
    mysqlPropsInputStream.close();
    return mysqlProps;
  }

  private Map<SqlQuery, String> loadSqlQueries(String fileName) throws IOException{
    InputStream queriesInputStream = getClass().getResourceAsStream("/"+fileName);
    Properties queries = new Properties();
    queries.load(queriesInputStream);
    queriesInputStream.close();

    return Map.of(
      SqlQuery.CREATE_BOX_TABLE, queries.getProperty("create-box-table"),
      SqlQuery.ALL_BOXES, queries.getProperty("all-boxes"),
      SqlQuery.STATISTICS_ABOUT_BOXES, queries.getProperty("statistics-about-boxes"),
      SqlQuery.SAVE_BOX, queries.getProperty("save-box"),
      SqlQuery.RESET_BOX_TABLE, queries.getProperty("reset-box-table")
    );
  }

}
