require('dotenv').config();
const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/chat', (req, res) => {
  console.log(req);
})

app.listen(5000, () => {
  console.log('Server running on port 5000...')
})