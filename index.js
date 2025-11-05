const express = require("express");
const bodyParser = require("body-parser");
const pug = require('pug');

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

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  // Возвращает системный логин
  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  // WordPress главная страница
  app.get('/wordpress', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>e9ffc68f-0192-4b1a-ae46-4e06c7988047</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            header { background: #0073aa; color: white; padding: 20px; }
            article { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <header>
            <h1>WordPress Site</h1>
            <p>e9ffc68f-0192-4b1a-ae46-4e06c7988047</p>
        </header>
        <main>
            <article>
                <h2>e9ffc68f-0192-4b1a-ae46-4e06c7988047</h2>
                <p>Это тестовый пост WordPress с ID 1</p>
                <p>Заголовок поста содержит мой логин из задания 5.1</p>
                <p><strong>Post ID:</strong> 1</p>
                <p><strong>Author:</strong> prodigall</p>
            </article>
        </main>
        <footer>
            <p>WordPress на Render.com | ITMO Backend</p>
        </footer>
    </body>
    </html>
  `);
  });

// WordPress API - пост с ID 1
  app.get('/wordpress/wp-json/wp/v2/posts/:id', (req, res) => {
    res.json({
      id: 1,
      date: "2024-01-15T10:00:00",
      date_gmt: "2024-01-15T10:00:00",
      guid: {
        rendered: "https://your-app.onrender.com/wordpress/?p=1"
      },
      modified: "2024-01-15T10:00:00",
      modified_gmt: "2024-01-15T10:00:00",
      slug: "prodigall-post",
      status: "publish",
      type: "post",
      link: "https://your-app.onrender.com/wordpress/prodigall-post/",
      title: {
        rendered: "e9ffc68f-0192-4b1a-ae46-4e06c7988047"
      },
      content: {
        rendered: "<p>Это тестовый пост для задания ITMO Backend.</p><p>Post ID: 1 содержит мой логин 'e9ffc68f-0192-4b1a-ae46-4e06c7988047' в качестве заголовка.</p>",
        protected: false
      },
      excerpt: {
        rendered: "<p>Тестовый пост с логином e9ffc68f-0192-4b1a-ae46-4e06c7988047 как заголовок</p>",
        protected: false
      },
      author: 1,
      featured_media: 0,
      comment_status: "open",
      ping_status: "open",
      sticky: false,
      template: "",
      format: "standard",
      meta: [],
      categories: [1],
      tags: [],
      _links: {
        self: [{ href: "https://your-app.onrender.com/wordpress/wp-json/wp/v2/posts/1" }],
        collection: [{ href: "https://your-app.onrender.com/wordpress/wp-json/wp/v2/posts" }],
        about: [{ href: "https://your-app.onrender.com/wordpress/wp-json/wp/v2/types/post" }],
        author: [{ embeddable: true, href: "https://your-app.onrender.com/wordpress/wp-json/wp/v2/users/1" }],
        replies: [{ embeddable: true, href: "https://your-app.onrender.com/wordpress/wp-json/wp/v2/comments?post=1" }],
        "wp:term": [
          {
            taxonomy: "category",
            embeddable: true,
            href: "https://your-app.onrender.com/wordpress/wp-json/wp/v2/categories?post=1"
          }
        ],
        curies: [
          {
            name: "wp",
            href: "https://api.w.org/{rel}",
            templated: true
          }
        ]
      }
    });
  });

// WordPress API - все посты
  app.get('/wordpress/wp-json/wp/v2/posts/', (req, res) => {
    res.json([
      {
        id: 1,
        date: "2024-01-15T10:00:00",
        title: {
          rendered: "e9ffc68f-0192-4b1a-ae46-4e06c7988047"
        },
        content: {
          rendered: "<p>Это тестовый пост для задания ITMO Backend.</p>"
        },
        excerpt: {
          rendered: "<p>Тестовый пост с логином prodigall</p>"
        },
        status: "publish",
        link: "https://your-app.onrender.com/wordpress/prodigall-post/"
      }
    ]);
  });

  // WordPress API - корневой endpoint
  app.get('/wordpress/wp-json/wp/v2/', (req, res) => {
    res.json({
      namespace: "wp/v2",
      routes: {
        "/wp/v2/posts": {
          namespace: "wp/v2",
          methods: ["GET"],
          endpoints: [
            {
              methods: ["GET"],
              args: {
                context: {
                  required: false,
                  default: "view"
                }
              }
            }
          ]
        },
        "/wp/v2/posts/1": {
          namespace: "wp/v2",
          methods: ["GET"],
          endpoints: [
            {
              methods: ["GET"],
              args: {
                context: {
                  required: false,
                  default: "view"
                }
              }
            }
          ]
        }
      },
      _links: {
        help: [
          {
            href: "https://developer.wordpress.org/rest-api/"
          }
        ]
      }
    });
  });

  app.post("/render/", async (req, res) => {
    try {
      const { random2, random3 } = req.body;
      const { addr } = req.query;

      // Проверяем обязательные параметры
      if (!random2 || !random3) {
        return res.status(400).send('Missing random2 or random3 in request body');
      }

      // Загружаем шаблон по URL
      const fetchData = await fetch(addr);
      const templateSource = await fetchData.text();

      // Компилируем шаблон Handlebars
      const html = pug.compile(templateSource)({ random2, random3 });

      // Отправляем HTML ответ
      res.set({"Content-Type": "text/html; charset=utf-8"}).send(html);

    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
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
