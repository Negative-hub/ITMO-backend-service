import express from 'express';
import multer from 'multer';
import crypto from 'crypto';

const app = express();
const upload = multer();

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

    const privateKey = keyFile.buffer.toString();
    const encryptedData = secretFile.buffer.toString();

    // Расшифровка с использованием приватного ключа
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedData, 'base64')
    );

    res.type('text/plain').send(decrypted.toString());

  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).send('Decryption failed: ' + error.message);
  }
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.send(`
    <h1>ITMO Decryption Service</h1>
    <ul>
      <li><a href="/login">GET /login</a> - returns login (google_2002)</li>
      <li>POST /decypher - decrypts data with private key</li>
    </ul>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});