// backend.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3306;

app.use(cors()); // Use CORS for cross-origin requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL database connection
const connection = mysql.createConnection({
  host: 'viaduct.proxy.rlwy.net',
  port: 50186,
  user: 'root',
  password: 'NvEZRElXKRkwlCQUvfryoLyskxrewkMd',
  database: 'railway' 
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query the database for the user
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // If user found, login successful
    if (results.length > 0) {
      res.status(200).json({ message: 'login success' });
    } else {
      res.status(401).json({ message: 'account or password wrong' });
    }
  });
});

// Route to retrieve game results
app.get('/results', (req, res) => {
  // Retrieve game results from the database
  const username = req.query.username;

  const query = 'SELECT win, lose, username FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.length > 0) {
      // If user found, send results back to client
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: 'Results not found' });
    }
  });
});

// Route to update game results
app.post('/update-results', (req, res) => {
  const { result, username } = req.body;

  // Update the database based on game result
  let updateQuery;
  if (result === 'win') {
    updateQuery = 'UPDATE users SET win = win + 1 WHERE username = ?';
  } else if (result === 'lose') {
    updateQuery = 'UPDATE users SET lose = lose + 1 WHERE username = ?';
  } else {
    res.status(400).json({ message: 'Invalid game result' });
    return;
  }

  // Execute the database update operation
  connection.query(updateQuery, [username] , (err, results) => {
    if (err) {
      console.error('Error updating database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // Return success response
    res.status(200).json({ message: 'Results updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
