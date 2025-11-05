import puppeteer from 'puppeteer';

/** Создание Express-приложения */
export default function (express, bodyParser, createReadStream, crypto, http, mongoose) {
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

  /** Чтение файла через поток */
  function readFileAsync(filePath, createReadStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const stream = createReadStream(filePath);

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      stream.on("error", (err) => reject(err));
    });
  }

  /** Генерация SHA1 хеша */
  function generateSha1Hash(text) {
    return crypto.createHash("sha1").update(text).digest("hex");
  }

  /** Чтение данных из HTTP-ответа */
  function readHttpResponse(response) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      response.on("error", (err) => reject(err));
    });
  }

  /** Универсальная функция для GET-запроса по URL */
  async function fetchUrlData(url) {
    return new Promise((resolve, reject) => {
      http.get(url, async (response) => {
        try {
          const data = await readHttpResponse(response);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      }).on("error", reject);
    });
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
    const { URL } = req.query;

    // Запуск браузера
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Настройка таймаутов
    page.setDefaultNavigationTimeout(15000);
    page.setDefaultTimeout(10000);

    await page.goto(URL, {
      waitUntil: ['domcontentloaded', 'networkidle2']
    });

    // Ожидание и клик по кнопке
    await page.waitForSelector('#bt', { timeout: 10000 });
    await page.click('#bt');

    // Ожидание результата в поле ввода
    await page.waitForFunction(
      () => {
        const input = document.getElementById('inp');
        return input && input.value !== '';
      },
      { timeout: 10000, polling: 100 }
    );

    // Получение значения
    return page.$eval('#inp', input => input.value);
  }

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  // Возвращает системный логин
  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  // Возвращает содержимое текущего файла
  app.get("/code/", async (_req, res) => {
    const fileContent = await readFileAsync(import.meta.url.substring(7), createReadStream);
    res.set(TEXT_PLAIN_HEADER).send(fileContent);
  });

  // Возвращает SHA1 хеш переданного параметра
  app.get("/sha1/:input/", (req, res) => {
    const hash = generateSha1Hash(req.params.input);
    res.set(TEXT_PLAIN_HEADER).send(hash);
  });

  // GET /req/?addr=<url>
  app.get("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.query.addr);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).send(err.toString());
    }
  });

  // POST /req/ с JSON { addr: <url> }
  app.post("/req/", async (req, res) => {
    try {
      const data = await fetchUrlData(req.body.addr);
      res.set(TEXT_PLAIN_HEADER).send(data);
    } catch (err) {
      res.status(500).send(err.toString());
    }
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
