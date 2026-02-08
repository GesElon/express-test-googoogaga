require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.post('/chat', (req, res) => {
  console.log(req);
})

app.listen(PORT, () => {
  console.log('Server running on port 5000...')
})