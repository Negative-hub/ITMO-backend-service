import express from 'express';
import multer from 'multer';
import forge from "node-forge";

const app = express();

// Настройка multer для обработки multipart/form-data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит
  },
});

// GET /login - возвращает логин
app.get('/login', (req, res) => {
  res.type('text/plain').send('google_2002');
});

// POST /decypher - расшифровка данных
app.post('/decypher', upload.fields([
  { name: 'key', maxCount: 1 },
  { name: 'secret', maxCount: 1 }
]), (req, res) => {
  try {
    const keyFile = req.files['key']?.[0];
    const secretFile = req.files['secret']?.[0];

    if (!keyFile || !secretFile) {
      return res.status(400).send('Missing key or secret files');
    }

    // Получаем содержимое приватного ключа
    const privateKeyPem = keyFile.buffer.toString("utf8");

    // Получаем зашифрованные данные
    const encryptedData = secretFile.buffer;

    // Парсим приватный ключ
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Расшифровываем данные
    const decrypted = privateKey.decrypt(
      encryptedData.toString('binary'),
      "RSA-OAEP"
    );

    // Возвращаем результат как обычную строку
    res.type("text/plain").send(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).send('Decryption failed: ' + error.message);
  }
});

// Корневой маршрут
app.get("/", (req, res) => {
  res.type("text/plain").send("ok");
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err);
  res.status(500).type("text/plain").send("Внутренняя ошибка сервера");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});