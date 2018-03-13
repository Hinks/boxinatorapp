package com.boxinatorapp.boxinatorapp.serverTest;

import com.boxinatorapp.boxinatorapp.database.DatabaseVerticle;
import com.boxinatorapp.boxinatorapp.httpserver.HttpServerVerticle;
import io.vertx.core.CompositeFuture;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.Async;
import io.vertx.ext.unit.TestOptions;
import io.vertx.ext.unit.TestSuite;
import io.vertx.ext.unit.report.ReportOptions;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.codec.BodyCodec;

import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * System test.
 * One longer test suite that tests the http api and a shorter one for getting a static resource.
 * The longer test suite involves 3 steps.
 *   1. send a get request when the database is empty.
 *   2. send 5 post requests (saving 5 boxes to the database).
 *   3. send a get request to control that the posted boxes were saved.
 *
 * The shorter test suite tests that the server responds with a index.html page
 * when visiting http://localhost:8080/
 *
 */
public class ApiTest {

  public static void main(String[] args) {
    new ApiTest().run();
  }

  private Vertx vertx;
  private WebClient webClient;

  public void run(){

    TestOptions options = new TestOptions().addReporter(new ReportOptions().setTo("console"));
    TestSuite suite = TestSuite.create("com.boxinatorapp.boxinatorapp.serverTest.ApiTest");

    suite.before(context -> {

      vertx = Vertx.vertx();

      JsonObject dbConf = new JsonObject()
        .put(DatabaseVerticle.CONFIG_MYSQL_JDBC_URL, "jdbc:mysql://localhost/boxinatordbtest?useSSL=false")
        .put("testMode", true);

      vertx.deployVerticle(new DatabaseVerticle(),
        new DeploymentOptions().setConfig(dbConf), context.asyncAssertSuccess());

      vertx.deployVerticle(new HttpServerVerticle(), context.asyncAssertSuccess());

      webClient = WebClient.create(vertx, new WebClientOptions()
        .setDefaultHost("localhost")
        .setDefaultPort(8080));

    });

    suite.test("get_and_post_requests_to_api_should_work", testContext -> {
      Async async = testContext.async();

      Future<JsonObject> emptyGetRequest = Future.future();
      webClient.get("/api/boxes")
        .as(BodyCodec.jsonObject())
        .send(ar -> {
          if (ar.succeeded()){
            HttpResponse<JsonObject> getResponse = ar.result();

            JsonObject expectedGetResponse = new JsonObject()
              .put("data", new JsonObject()
                .put("boxes", new JsonArray())
                .put("totalWeight", 0f)
                .put("totalShippingCost", 0f));

            testContext.assertEquals(expectedGetResponse, getResponse.body());
            emptyGetRequest.complete(getResponse.body());
          }else{
            testContext.fail(ar.cause());
          }
        });

      Future<JsonObject> postRequests = Future.future();
      emptyGetRequest.compose(emptyGetResponse -> {

        List<Future> postRequestList = ApiTestUtils
          .testBoxCollection()
          .stream()
          .map(box -> {
            JsonObject clientJsonBox = (JsonObject) box;
            return ApiTestUtils.makeBoxPostRequest(webClient, "/api/savebox", clientJsonBox);
          })
          .collect(Collectors.toList());

        CompositeFuture.all(postRequestList).setHandler(ar -> {
          if (ar.succeeded()){
            postRequests.complete(new JsonObject());
          }else {
            testContext.fail(ar.cause());
          }
        });

      }, postRequests);

      Future<JsonObject> getRequest = Future.future();
      postRequests.compose(h -> {

        webClient.get("/api/boxes")
          .as(BodyCodec.jsonObject())
          .send(ar -> {
            if (ar.succeeded()){
              HttpResponse<JsonObject> getResponse = ar.result();
              getRequest.complete(getResponse.body());

            }else{
              testContext.fail(ar.cause());
            }
          });

      }, getRequest);

      getRequest.compose(jsonResponse -> {

        JsonObject data = jsonResponse.getJsonObject("data");

        BiFunction<Float, Float, Predicate<Float>> isBetween = (minValue, maxValue) ->
          actualValue -> minValue < actualValue && actualValue < maxValue;

        //totalshippingcost in the testBoxCollecton should be 82.003.
        float totalShippingCost = data.getFloat("totalShippingCost");
        boolean totalShippingCostIsCorrect = isBetween.apply(81f, 83f).test(totalShippingCost);

        //totalWeight in the testBoxCollecton should be 14.005.
        float totalWeight = data.getFloat("totalWeight");
        boolean totalWeightIsCorrect = isBetween.apply(13f, 15f).test(totalWeight);

        testContext.assertEquals(true, totalShippingCostIsCorrect, "Total shipping cost is credible");
        testContext.assertEquals(true, totalWeightIsCorrect, "Total weight is credible");
        testContext.assertEquals(4, data.getJsonArray("boxes").size(), "Number of boxes should be 4");
        async.complete();

      }, Future.failedFuture("Oh?"));

    });

    suite.test("get_static_resource_index.html", testContext -> {
      Async async = testContext.async();

      webClient.get("/")
        .send(ar -> {
          if (ar.succeeded()){
          HttpResponse<Buffer> response = ar.result();

          testContext.assertEquals(200, response.statusCode());
          testContext.assertEquals("text/html;charset=UTF-8", response.getHeader("Content-Type"));
          async.complete();
          }else{
            testContext.fail(ar.cause());
          }
        });
    });

    suite.after(context -> {
      vertx.close(context.asyncAssertSuccess());
    });

    suite.run(options);
  }
}
