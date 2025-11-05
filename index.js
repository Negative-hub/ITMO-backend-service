const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const jsdom = require("jsdom");

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

  async function insertNewUser(req, res) {
    const userSchema = new mongoose.Schema({
      login: String,
      password: String
    });

    // Модель пользователя
    const User = mongoose.model('User', userSchema, 'users');

    const { login, password, URL } = req.body;

    // Проверка наличия обязательных полей
    if (!login || !password || !URL) {
      return res.status(400).json({
        error: 'Необходимы параметры: login, password и URL'
      });
    }

    // Подключение к MongoDB
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Создание и сохранение нового пользователя
    const newUser = new User({ login, password });
    await newUser.save();

    // Закрытие соединения
    await mongoose.connection.close();
  }

  async function clickWebPage(req){
    const targetUrl = req.query.URL;

    // Получаем HTML целевой страницы
    const response = await fetch(targetUrl);
    const html = await response.text();

    // Создаем виртуальный DOM с JSDOM
    const dom = new jsdom.JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable'
    });

    const window = dom.window;
    const document = window.document;

    // Ждем загрузки DOM
    await new Promise(resolve => {
      if (window.document.readyState === 'loading') {
        window.document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });

    // Находим кнопку по ID
    const button = document.getElementById('bt');
    // Находим поле ввода по ID
    const input = document.getElementById('inp');

    // Кликаем по кнопке
    button.click();

    // Даем время на выполнение скриптов после клика
    await new Promise(resolve => setTimeout(resolve, 100));

    // Получаем значение из поля ввода
    return input.value;
  }

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  // Возвращает системный логин
  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  // POST /req/ с JSON { addr: <url> }
  app.post("/insert/", async (req, res) => {
    try {
      await insertNewUser(req, res);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  app.get('/test/', async (req, res) => {
    try {
      const data = await clickWebPage(req);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  })

  // Любой другой маршрут возвращает системный логин
  app.all(/.*/, (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  return app;
}


const app = createApp();
app.listen(80);
