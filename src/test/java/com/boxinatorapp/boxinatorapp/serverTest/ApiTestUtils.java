package com.boxinatorapp.boxinatorapp.serverTest;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;

public class ApiTestUtils {

  public static JsonArray testBoxCollection(){

    JsonObject box1 = createClientJsonBox("Sven Svensson", 2.5f, "0,0,0", "Sweden");
    JsonObject box2 = createClientJsonBox("Sun Yen", 3.75f, "0,0,0", "China");
    JsonObject box3 = createClientJsonBox("Fernando Alonso", 5.655f, "0,255,0", "Brazil");
    JsonObject box4 = createClientJsonBox("Smith Jones", 2.1f, "100,255,0", "Australia");

    JsonArray boxes = new JsonArray()
      .add(box1)
      .add(box2)
      .add(box3)
      .add(box4);

    return boxes;
  }

  private static JsonObject createClientJsonBox(String receiver, Float weight, String color, String country){
    JsonObject box = new JsonObject()
      .put("receiver", receiver)
      .put("weight", weight)
      .put("color", color)
      .put("destinationCountry", country);
    return box;
  }

  public static Future<JsonObject> makeBoxPostRequest(WebClient webClient, String url, JsonObject clientJsonBox){
    Future<JsonObject> future = Future.future();
    webClient.post(url)
      .as(BodyCodec.jsonObject())
      .sendJsonObject(clientJsonBox, ar -> {
        if (ar.succeeded()){
          HttpResponse<JsonObject> postResponse = ar.result();
          future.complete(postResponse.body());
        }else {
          future.fail(ar.cause());
        }
      });
    return future;
  }

}
