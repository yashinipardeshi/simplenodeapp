// index.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// /home → simple HTML form to input numbers
app.get('/', (req, res) => {
  res.send(`
    <h1>Simple Node Calculator</h1>
    <form action="/page1" method="get">
      <input type="number" name="num1" placeholder="Number 1" required />
      <input type="number" name="num2" placeholder="Number 2" required />
      <button type="submit">Get Sum</button>
    </form>
    <form action="/page2" method="get" style="margin-top:20px;">
      <input type="number" name="num1" placeholder="Number 1" required />
      <input type="number" name="num2" placeholder="Number 2" required />
      <button type="submit">Get Difference</button>
    </form>
  `);
});

// /page1 → sum
app.get('/page1', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) return res.send('Invalid numbers');
  const sum = num1 + num2;
  res.send(`<h1>Sum: ${sum}</h1><a href="/home">Go Back</a>`);
});

// /page2 → difference
app.get('/page2', (req, res) => {
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);
  if (isNaN(num1) || isNaN(num2)) return res.send('Invalid numbers');
  const diff = num1 - num2;
  res.send(`<h1>Difference: ${diff}</h1><a href="/home">Go Back</a>`);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
