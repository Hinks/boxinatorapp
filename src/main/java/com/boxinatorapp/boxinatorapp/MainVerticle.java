package com.boxinatorapp.boxinatorapp;

import com.boxinatorapp.boxinatorapp.database.DatabaseVerticle;
import com.boxinatorapp.boxinatorapp.httpserver.HttpServerVerticle;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.Launcher;

/**
 * This class starts the two verticles, first the database verticle
 * then the http server.
 */
public class MainVerticle extends AbstractVerticle {

  public static void main(String[] args) {
    Launcher.executeCommand("run", MainVerticle.class.getName());
  }

  @Override
  public void start(Future<Void> startFuture) throws Exception {

    Future<String> dbVerticleDeployment = Future.future();
    vertx.deployVerticle(new DatabaseVerticle(), dbVerticleDeployment.completer());

    dbVerticleDeployment.compose(id -> {

      Future<String> httpVerticleDeployment = Future.future();
      vertx.deployVerticle(
        new HttpServerVerticle(),
        httpVerticleDeployment.completer());

      return httpVerticleDeployment;

    }).setHandler(ar -> {
      if (ar.succeeded()) {
        startFuture.complete();
      } else {
        startFuture.fail(ar.cause());
      }
    });

  }
}
