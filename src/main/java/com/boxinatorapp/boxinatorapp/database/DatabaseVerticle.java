package com.boxinatorapp.boxinatorapp.database;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLConnection;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;
import java.util.function.BiConsumer;

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
        fetchBoxesHandler.accept(dbClient, message);
        break;
      case "stats-boxes":
        fetchStatsAboutBoxesHandler.accept(dbClient, message);
        break;
      case "save-box":
        saveBoxHandler.accept(dbClient, message);
        break;
      default:
        message.fail(ErrorCodes.BAD_ACTION.ordinal(), "Bad action: " + action);
    }
  }

  private BiConsumer<JDBCClient, Message<JsonObject>> fetchBoxesHandler = (dbClient, message) -> {

    DbOperations.fetchBoxes(dbClient, sqlQueries.get(SqlQuery.ALL_BOXES))
      .setHandler(arBoxes -> {
        if (arBoxes.succeeded()){
          message.reply(arBoxes.result());
        }else {
          reportQueryError(message, arBoxes.cause());
        }
      });
  };

  private BiConsumer<JDBCClient, Message<JsonObject>> fetchStatsAboutBoxesHandler = (dbClient, message) -> {

    DbOperations.fetchStatisticsAboutBoxes(dbClient, sqlQueries.get(SqlQuery.STATISTICS_ABOUT_BOXES))
      .setHandler(arStats -> {
        if (arStats.succeeded()){
          message.reply(arStats.result());
        }else {
          reportQueryError(message, arStats.cause());
        }
      });
  };

  private BiConsumer<JDBCClient, Message<JsonObject>> saveBoxHandler = (dbClient, message) -> {

    JsonObject clientJsonBox = message.body().getJsonObject("clientJsonBox");
    JsonArray params = DbUtils.convertClientBoxToJsonArray(clientJsonBox);

    DbOperations.saveBox(dbClient, sqlQueries.get(SqlQuery.SAVE_BOX), params)
      .setHandler(arSaveStatus -> {
        if (arSaveStatus.succeeded()){
          message.reply(arSaveStatus.result());
        }else {
          reportQueryError(message, arSaveStatus.cause());
        }
      });
  };

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
