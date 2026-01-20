const axios = require('axios');
const { JSDOM } = require('jsdom');
const express = require('express');

const app = express();
const PORT = 3000;

// Маршрут /login
app.get("/login", (req, res) => {
  res.send("google_2002");
});

// Маршрут /zombie
app.get('/zombie/:num', async (req, res) => {
  try {
    const num = req.params.num;
    const targetUrl = `https://kodaktor.ru/g/d7290da?${num}`;

    const response = await axios.get(targetUrl);
    const dom = new JSDOM(response.data, {
      url: targetUrl,
      runScripts: 'dangerously', // Включаем выполнение JS
      resources: "usable"
    });

    const window = dom.window;
    const document = window.document;

    // Ждем загрузки
    await new Promise(resolve => {
      window.addEventListener('load', resolve);
      setTimeout(resolve, 3000);
    });

    // Ищем кнопку
    const button = document.querySelector('button');
    if (button) {
      button.click();

      // Ждем обновления
      await new Promise(r => setTimeout(r, 1000));
    }

    const result = document.title;
    res.type('text/plain').send(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).type('text/plain').send('Error: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
