const express = require('express');
const { createCanvas } = require('canvas');

const app = express();

const LOGIN = "google_2002"; // заменить login

app.get('/login', (req, res) => {
  res.type('text/plain').send(LOGIN);
});

app.get('/makeimage', (req, res) => {
  const width = parseInt(req.query.width) || 100;
  const height = parseInt(req.query.height) || 100;

  // Ограничиваем максимальный размер
  const maxSize = 2000;
  const safeWidth = Math.min(Math.max(width, 1), maxSize);
  const safeHeight = Math.min(Math.max(height, 1), maxSize);

  // Создаем canvas и изображение
  const canvas = createCanvas(safeWidth, safeHeight);
  const ctx = canvas.getContext('2d');

  // Заполняем изображение (пример)
  ctx.fillStyle = `rgb(${safeWidth % 255}, ${safeHeight % 255}, 100)`;
  ctx.fillRect(0, 0, safeWidth, safeHeight);

  // Добавляем текст с размерами
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`${safeWidth}x${safeHeight}`, 10, 30);

  // Отправляем как PNG
  res.set('Content-Type', 'image/png');
  canvas.createPNGStream().pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});