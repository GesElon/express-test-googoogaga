require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;

function appendObjectToJson(filePath, newEntry) {
  try {
    // Step 1: Read the existing file
    let fileData = [];
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8');
      if (rawData.trim()) {
        fileData = JSON.parse(rawData) || [];
      }
    }

    // Step 2: Add new data
    fileData.push(newEntry);

    // Step 3: Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');

    console.log("✅ Data added successfully!");
  } catch (err) {
    console.error("❌ Error updating JSON file:", err.message);
  }
}

function logRequest(req, urlThatReceived) {
  appendObjectToJson(logJsonPath, {
    urlThatReceived: urlThatReceived,
    received: new Date().getUTCMilliseconds(),
    headers: req.headers,
    body: req.body
  })
}

function logApiResponse(res) {
  appendObjectToJson(resLogJsonPath, res.data);
}

const logJsonPath = path.join(__dirname, 'log.json');
const resLogJsonPath = path.join(__dirname, 'responses-log.json');

const aiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello! I"m cool!');
});

app.get('/log', (req, res) => {
  const rawData = fs.readFileSync(logJsonPath, 'utf8');
  if (rawData.trim()) {
    const fileData = JSON.parse(rawData) || [];
    res.json(fileData);
  }
});

app.get('/res-log', (req, res) => {
  const rawData = fs.readFileSync(resLogJsonPath, 'utf8');
  if (rawData.trim()) {
    const fileData = JSON.parse(rawData) || [];
    res.json(fileData);
  }
});

app.post('/chat', async (req, res) => {
  console.log('received');
  logRequest(req, '/chat');

  req.body.origin = 'http://localhost:5000';
  req.body.referer = 'http://localhost:5000';

  try {
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    })

    // Forward status + headers
    res.status(response.status)
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    // IMPORTANT: stream the body
    const reader = response.body.getReader()

    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Cache-Control', 'no-cache')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }

    res.end()
    // const response = {
    //   data: {
    //     choices: [{
    //       message: {
    //         role: 'noob',
    //         content: 'hello'
    //       }
    //     }]
    //   }
    // }

    // res.status(200);
    // console.log(response);
    // logApiResponse(response);
    // res.json(response.data);
  } catch(err) {
    console.log(err)
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}...`)
})