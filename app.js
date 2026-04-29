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
    <h1>Simple Node Calculator - test 3</h1>
    <form action="/page1" method="get">
      <input type="number" name="num1" placeholder="Number 11" required />
      <input type="number" name="num2" placeholder="Number 22" required />
      <button type="submit">Get Sum</button>
    </form>
    <form action="/page2" method="get" style="margin-top:20px;">
      <input type="number" name="num1" placeholder="Number 11" required />
      <input type="number" name="num2" placeholder="Number 22" required />
      <button type="submit">Get Difference</button>
    </form>
  `);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
