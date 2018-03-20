package com.boxinatorapp.boxinatorapp.database;

import com.boxinatorapp.boxinatorapp.ShippingCostUtils;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.sql.SQLOptions;
import io.vertx.ext.sql.UpdateResult;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.function.Consumer;
import java.util.function.Function;

public class DatabaseVerticle extends AbstractVerticle {

  private static final Logger LOGGER = LoggerFactory.getLogger(DatabaseVerticle.class);
  public static final String CONFIG_MYSQL_JDBC_URL = "mysql.jdbc.url";
  public static final String CONFIG_MYSQL_JDBC_DRIVER_CLASS = "mysql.jdbc.driver_class";
  public static final String CONFIG_BOXINATORDB_QUEUE = "boxinatordb.queue";
  private JDBCClient dbClient;

  public enum ErrorCodes {
    NO_ACTION_SPECIFIED,
    BAD_ACTION,
    DB_ERROR
  }

  @Override
  public void start(Future<Void> startFuture) throws Exception {

    //(blocking operation), but file size is small.
    Properties mysqlProps = getMySQLProperties();

    dbClient = JDBCClient.createShared(vertx, new JsonObject()
      .put("url", config().getString(CONFIG_MYSQL_JDBC_URL, "jdbc:mysql://localhost/boxinatordb?useSSL=false"))
      .put("driver_class", config().getString(CONFIG_MYSQL_JDBC_DRIVER_CLASS, "com.mysql.cj.jdbc.Driver"))
      .put("user", mysqlProps.getProperty("user"))
      .put("password", mysqlProps.getProperty("password")));

    Future<SQLConnection> prepareDatabase = Future.future();
    dbClient.getConnection(prepareDatabase);
    prepareDatabase
      .compose(conn -> createBoxTableIfNotExists(conn))
      .compose(conn -> resetBoxTableIfUsingTestDatabase(conn))
      .compose(conn -> handleSuccessfulDatabasePreparation(conn, startFuture), Future.future())
      .otherwise(err -> handleDatabasePreparationFailure(err, startFuture));

  }

  /**
   * Creates a table called Box in the database if it doesn't already exist there.
   *
   * @param conn An open connection to the database.
   * @return A future returning the sql connection when it is completed.
   */
  private Future<SQLConnection> createBoxTableIfNotExists(SQLConnection conn){
    Future<Void> f1 = Future.future();
    conn.execute(SqlQueries.CREATE_BOX_TABLE, f1);
    return f1.compose(h -> Future.succeededFuture(conn));
  }

  /**
   * Removes all records in the Box table, if test mode is enabled.
   * When test mode is enabled this verticle uses the database called
   * boxinatordbtest instead of boxinatordb.
   *
   * @param conn An open connection to the database.
   * @return A future returning the sql connection when it is completed.
   */
  private Future<SQLConnection> resetBoxTableIfUsingTestDatabase(SQLConnection conn){

    Future<Void> f1 = Future.future();
    boolean testModeIsEnabledInVertxConfig = config().getBoolean("testMode", false);

    if (testModeIsEnabledInVertxConfig){
      conn.execute(SqlQueries.RESET_TABLE, f1);
    }else {
      f1.complete();
    }
    return f1.compose(v -> Future.succeededFuture(conn));
  }

  /**
   * If all the previous database preparation steps were successful
   * this method will do the final tasks before this verticle is ready
   * to be deployed. The first task is to close the database connection
   * used in the previous preparation steps. The second task is to register
   * this verticle to consume incoming eventbus messages on the specified
   * consumer address. Finally this methods completes the start-future
   * in the start method, telling that this verticle is ready to deploy.
   *
   * @param conn The connection used by the the previous preparation steps.
   * @param startFuture The startFuture in the start methods parameter.
   */
  private void handleSuccessfulDatabasePreparation(SQLConnection conn, Future<Void> startFuture){
    conn.close();
    vertx.eventBus().consumer(config().getString(CONFIG_BOXINATORDB_QUEUE, "boxinatordb.queue"), this::onMessage);
    startFuture.complete();
  }

  /**
   * If any of the database preparation steps fails,
   * the error will be passed down to this method.
   *
   * @param err The error that occurred in one of the preparation steps.
   * @param startFuture The startFuture in the start methods parameter, when that future fails
   *                    this verticle won't be able to deploy.
   * @return String that is not used.
   */
  private String handleDatabasePreparationFailure(Throwable err, Future<Void> startFuture ){
    LOGGER.error(err);
    startFuture.fail(err);
    return err.getMessage();
  }

  /**
   *
   * Handles eventbus messages that is sent to the consumer address this
   * verticle listens to. Depending on the action type of the message,
   * the switch-case delegates the incoming message object to the right message handler.
   *
   * @param message Message that is sent to the consumer address this verticle listens to.
   */
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
        fetchBoxesAndStats(message);
        break;
      case "save-box":
        saveBoxHandler().apply(dbClient).accept(message);
        break;
      default:
        message.fail(ErrorCodes.BAD_ACTION.ordinal(), "Bad action: " + action);
    }
  }

  /**
   * Helper method that responds to the sender that something went wrong.
   *
   * @param message Message that is sent to the consumer address this verticle listens to.
   * @param cause The error that happened.
   */
  private void reportQueryError(Message<JsonObject> message, Throwable cause) {
    LOGGER.error("Database query error", cause);
    message.fail(ErrorCodes.DB_ERROR.ordinal(), cause.getMessage());
  }

  /**
   * This method performs two async database operations, one fetches all boxes stored in the Box table,
   * and the other one fetches statics about the boxes(totalWeight and totalShippingCost).
   *
   * After the two async db operations has succeeded this method replies with a json object, like this:
   *{
   *  "boxes": [
   *    {
   *      "Receiver": String,
   *      "Weight": Float,
   *      "Color": String ("0,0,0"),
   *      "ShippingCost": Float
   *    }
   *  ],
   *  "totalWeight": Float,
   *  "totalShippingCost": Float
   *}
   * to the sender of the message. In this case the sender is the HttpServerVerticle.
   *
   * @param message Message that is sent to the consumer address this verticle listens to.
   */
  private void fetchBoxesAndStats(Message<JsonObject> message) {

    Future<SQLConnection> f1 = Future.future();
    dbClient.getConnection(f1);
    f1
      .compose(conn -> {

        Future<JsonObject> f2 = Future.future();

        Future<JsonArray> boxesFuture = fetchBoxes(conn);
        Future<JsonObject> statsAboutBoxesFuture = fetchStatsAboutBoxes(conn);

        CompositeFuture.all(boxesFuture, statsAboutBoxesFuture)
          .setHandler(ar -> {
            conn.close();

            if (ar.succeeded()){
              JsonObject boxes = new JsonObject().put("boxes", boxesFuture.result());
              JsonObject stats = statsAboutBoxesFuture.result();
              f2.complete(boxes.mergeIn(stats));
            }else {
              f2.fail(ar.cause());
            }
          });

        return f2;
      })
      .compose(res -> {
        message.reply(res);
        return Future.future();
      })
      .otherwise(err -> {
        reportQueryError(message, err);
        return 0;
      });

  }

  private Function<JDBCClient, Consumer<Message<JsonObject>>> saveBoxHandler(){
    return dbClient -> message -> {

      JsonObject clientJsonBox = message.body().getJsonObject("clientJsonBox");
      JsonArray params = clientJsonBoxToDbInsertParams(clientJsonBox);

      Future<UpdateResult> f1 = Future.future();
      dbClient.updateWithParams(SqlQueries.SAVE_BOX, params, f1);
      f1.compose(updateResult -> {

        message.reply(new JsonObject().put("newBoxCreated", true));
        return Future.future();
      })
      .otherwise(err -> {
        reportQueryError(message, err);
        return 0;
      });

    };
  }

  /**
   * Converts a client json box which has the following format:
   *
   * {
   *  "receiver": String,
   *  "weight": Float,
   *  "color": String ("0,0,0"),
   *  "destinationCountry: String
   * }
   *
   * to a JsonArray that can be used as params when calling
   * connection.updateWithParams(...) when inserting a new box.
   *
   * @param clientJsonBox Box posted by web client.
   * @return JsonArray containing the values of the clientJsonBox plus the calculated shippingCost
   *         for the box.
   */
  private JsonArray clientJsonBoxToDbInsertParams(JsonObject clientJsonBox){

    String receiver = clientJsonBox.getString("receiver");
    float weight = clientJsonBox.getFloat("weight");
    String color = clientJsonBox.getString("color");
    String destinationCountry = clientJsonBox.getString("destinationCountry");

    float shippingCost = ShippingCostUtils.calculateCost(
      ShippingCostUtils.countryMultipliers(),
      destinationCountry,
      weight);

    JsonArray params = new JsonArray()
      .add(receiver)
      .add(weight)
      .add(shippingCost)
      .add(color)
      .add(destinationCountry);

    return params;
  }

  /**
   * Gets all boxes stored in the database as a JsonArray.
   * The JsonArray has the following format.
   *
   * [
   *  {
   *    "Id" : Integer,
   *    "Receiver" : String,
   *    "Weight" : Float,
   *    "Color" : String ("0,0,0"),
   *    "ShippingCost" : Float
   *  },...
   * ]
   *
   * @param conn An open connection to the database.
   * @return A future with a JsonArray as it's result when completed.
   */
  private Future<JsonArray> fetchBoxes(SQLConnection conn) {
    Future<JsonArray> future = Future.future();
    conn.query(SqlQueries.ALL_BOXES, res -> {

      if (res.succeeded()) {
        ResultSet rs = res.result();
        JsonArray boxes = rs.toJson().getJsonArray("rows");
        future.complete(boxes);
      } else {
        future.fail(res.cause());
      }
    });
    return future;
  }

  /**
   * Gets statics about the boxes(totalWeight and totalShippingCost).
   * If the database is empty totalWeight and totalShippingCost are set to 0.
   * The returned JsonObject has the following format:
   * {
   *  "totalWeight": Float,
   *  "totalShippingCost": Float
   * }
   * @param conn An open connection to the database.
   * @return A future with a JsonObject as it's result when completed.
   */
  private Future<JsonObject> fetchStatsAboutBoxes(SQLConnection conn) {
    Future<JsonObject> future = Future.future();

    conn.query(SqlQueries.STATS, res -> {

      if (res.succeeded()) {
        ResultSet resultSet = res.result();
        JsonObject rows = resultSet.toJson().getJsonArray("rows").getJsonObject(0);

        float totalWeight = ((rows.getFloat("TotalWeight") == null) ? 0f : rows.getFloat("TotalWeight"));
        float totalShippingCost = ((rows.getFloat("TotalShippingCost") == null) ? 0f : rows.getFloat("TotalShippingCost"));

        JsonObject stats = new JsonObject()
          .put("totalWeight", totalWeight)
          .put("totalShippingCost", totalShippingCost);

        future.complete(stats);
      } else {
        future.fail(res.cause());
      }
    });
    return future;
  }

  /**
   * Reads the src/main/resources/mysql.properties and loads it into a Properties object.
   *
   * @return Properties object containing two properties: "user" and "password" for a mysql user.
   * @throws IOException
   */
  private Properties getMySQLProperties() throws IOException {

    InputStream mysqlPropsInputStream = getClass().getResourceAsStream("/mysql.properties");
    Properties mysqlProps = new Properties();
    mysqlProps.load(mysqlPropsInputStream);
    mysqlPropsInputStream.close();

    return mysqlProps;
  }
}
