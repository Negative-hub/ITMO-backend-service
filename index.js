const express = require('express');
const https = require('https');

const app = express();
const LOGIN = "google_2002"; // заменить login

app.get('/login', (req, res) => {
  res.type('text/plain').send(LOGIN);
});

app.get('/id/:N', (req, res) => {
  const N = req.params.N;
  const options = {
    hostname: 'nd.kodaktor.ru',
    path: `/users/${N}`,
    method: 'GET',
    headers: {
      // Content-Type заголовок отсутствует намеренно
    }
  };

  https.get(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.login) {
          res.type('text/plain').send(json.login);
        } else {
          res.status(404).send('Login field not found');
        }
      } catch (e) {
        res.status(500).send('Ошибка обработки данных');
      }
    });
  }).on('error', (err) => {
    res.status(500).send('Ошибка запроса к удалённому серверу');
  });
});

app.listen(8080);