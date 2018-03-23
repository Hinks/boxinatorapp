package com.boxinatorapp.boxinatorapp.httpserver;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.eventbus.DeliveryOptions;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;

import java.util.HashSet;
import java.util.Set;

public class HttpServerVerticle extends AbstractVerticle {

  private static final Logger LOGGER = LoggerFactory.getLogger(HttpServerVerticle.class);
  public static final String CONFIG_HTTP_SERVER_PORT = "http.server.port";
  public static final String CONFIG_BOXINATORDB_QUEUE = "boxinatordb.queue";
  private String boxinatorDbQueue = "boxinatordb.queue";

  @Override
  public void start(Future<Void> startFuture) throws Exception {

    boxinatorDbQueue = config().getString(CONFIG_BOXINATORDB_QUEUE, "boxinatordb.queue");

    HttpServer server = vertx.createHttpServer();

    Router router = Router.router(vertx);
    enableCorsAccess(router);
    enableStaticServingOfReactResources(router);

    router.get("/api/boxes").handler(this::boxesHandler);
    router.get("/api/stats/boxes").handler(this::statsBoxesHandler);
    router.post().handler(BodyHandler.create());
    router.post("/api/savebox").handler(this::saveBoxHandler);

    int portNumber = config().getInteger(CONFIG_HTTP_SERVER_PORT, 8080);
    server
      .requestHandler(router::accept)
      .listen(portNumber, ar -> {
        if (ar.succeeded()) {
          LOGGER.info("HTTP server running on port " + portNumber);
          startFuture.complete();
        } else {
          LOGGER.error("Could not start a HTTP server", ar.cause());
          startFuture.fail(ar.cause());
        }
      });
  }

  /**
   * Configuring the router to serve static resources to web clients.
   * The static resources are in this case the files created by
   * the create-react-app after building a production ready version
   * of the frontend application with the command: npm run build.
   *
   * @param router The HttpServer's request handler.
   */
  private void enableStaticServingOfReactResources(Router router){

    router.get("/*").handler(
      StaticHandler
        .create()
        .setWebRoot("src/main/resources/webroot/boxinator-client/build")
        .setCachingEnabled(false)
    );

    router.get("/").handler(context -> context.reroute("/index.html"));

    router.route("/static/*").handler(
      StaticHandler
        .create()
        .setWebRoot("src/main/resources/webroot/boxinator-client/build/static")
        .setCachingEnabled(false));
  }

  /**
   * Configuring the router to enable cors access, this is useful when
   * developing and running the frontend application with the bundled
   * create-react-app server. If cors is not enabled window.fetch gives you:
   *
   *  Fetch API cannot load http://localhost:8080/api/xxx.
   *  No 'Access-Control-Allow-Origin' header is present on the requested resource.
   *
   * @param router The HttpServer's request handler.
   */
  private void enableCorsAccess(Router router) {
    Set<String> allowedHeaders = new HashSet<>();
    allowedHeaders.add("x-requested-with");
    allowedHeaders.add("Access-Control-Allow-Origin");
    allowedHeaders.add("origin");
    allowedHeaders.add("Content-Type");
    allowedHeaders.add("accept");
    allowedHeaders.add("X-PINGARUNER");

    Set<HttpMethod> allowedMethods = new HashSet<>();
    allowedMethods.add(HttpMethod.GET);
    allowedMethods.add(HttpMethod.POST);
    allowedMethods.add(HttpMethod.OPTIONS);

    router.route().handler(CorsHandler.create("*").allowedHeaders(allowedHeaders).allowedMethods(allowedMethods));
  }

  private void boxesHandler(RoutingContext context) {

    DeliveryOptions options = new DeliveryOptions().addHeader("action", "all-boxes");
    vertx.eventBus().send(boxinatorDbQueue, new JsonObject(), options, reply -> {
      if (reply.succeeded()) {

        JsonObject replyMsg = (JsonObject) reply.result().body();
        JsonObject clientResponse = new JsonObject().put("data", replyMsg);

        context.response()
          .setStatusCode(200)
          .putHeader("Content-Type", "application/json")
          .end(clientResponse.encodePrettily());

      } else {
        context.fail(reply.cause());
      }
    });
  }

  private void statsBoxesHandler(RoutingContext context) {
    DeliveryOptions options = new DeliveryOptions().addHeader("action", "stats-boxes");
    vertx.eventBus().send(boxinatorDbQueue, new JsonObject(), options, reply -> {
      if (reply.succeeded()) {

        JsonObject replyMsg = (JsonObject) reply.result().body();
        JsonObject clientResponse = new JsonObject().put("data", replyMsg);

        context.response()
          .setStatusCode(200)
          .putHeader("Content-Type", "application/json")
          .end(clientResponse.encodePrettily());

      } else {
        context.fail(reply.cause());
      }
    });
  }
  
  private void saveBoxHandler(RoutingContext context) {

    DeliveryOptions options = new DeliveryOptions().addHeader("action", "save-box");
    JsonObject clientJsonBox = context.getBodyAsJson();

    vertx.eventBus().send(boxinatorDbQueue, new JsonObject().put("clientJsonBox", clientJsonBox), options, reply -> {
      if (reply.succeeded()) {

        JsonObject replyMsg = (JsonObject) reply.result().body();
        JsonObject clientResponse = new JsonObject().put("data", replyMsg);

        context.response()
          .putHeader("Content-Type", "application/json")
          .end(clientResponse.encodePrettily());

      } else {
        context.fail(reply.cause());
      }
    });
  }

}
