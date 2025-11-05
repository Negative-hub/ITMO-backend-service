const express = require("express");
const bodyParser = require("body-parser");
const monogodb = require('mongodb');

/** Создание Express-приложения */
function createApp() {
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS,DELETE",
    "Access-Control-Allow-Headers": "*",
  };

  const TEXT_PLAIN_HEADER = {
    "Content-Type": "text/plain; charset=utf-8",
  };

  const SYSTEM_LOGIN = "e9ffc68f-0192-4b1a-ae46-4e06c7988047";

  /** Middleware для CORS */
  function corsMiddleware(req, res, next) {
    res.set(CORS_HEADERS);
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  }

  async function insertNewUser(req) {
    const { login, password, URL } = req.body;

    // Подключаемся к MongoDB
    const client = new monogodb.MongoClient(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();

    const db = client.db();
    const usersCollection = db.collection('users');

    // Вставляем документ
    await usersCollection.insertOne({ login, password });

    await client.close();
  }

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  // Возвращает системный логин
  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  app.post("/insert/", async (req, res) => {
    try {
      await insertNewUser(req);
      res.status(200).send();
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // Любой другой маршрут возвращает системный логин
  app.all(/.*/, (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  return app;
}


const app = createApp();
app.listen(8080);
