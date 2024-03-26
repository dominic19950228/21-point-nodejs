// backend.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(cors()); // �ϥ� CORS ���M��
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// �������Τ��ơA������Τ��ݭn�s�x�b�ƾڮw��
/*const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' }
];*/

// MySQL �ƾڮw�s��
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test' // �������z���ƾڮw�W��
});

// �s���� MySQL �ƾڮw
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// �n������
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // �b?�u?���d���?
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // �p�G����?�A��ܵn?���\
    if (results.length > 0) {
      res.status(200).json({ message: 'login success' });
    } else {
      res.status(401).json({ message: 'account or password wrong' });
    }
  });
});


app.get('/results', (req, res) => {
  // �b�o�̽s�g�q��Ʈw���˯��ӭt���G��ƪ��{���X
   // ���] 'win' �M 'lose' �O��Ʈw�������W
   // �q��Ʈw���d�� 'win' �M 'lose' ���ȡA�ñN��@�� JSON ��ƶǦ^�Ȥ��

  const username = req.query.username; // ?��?�D������?�W??

  const query = 'SELECT win, lose, username FROM users WHERE username = ?'; // �ϥ� WHERE �l�y���w��?�W
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.length > 0) {
      // �p�G���F��?�A???�G?�e�^��?��
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: 'Results not found' });
    }
  });
});






// '/update-results' ���ѡA�Ω��s�ӭt���G�ƾ�
app.post('/update-results', (req, res) => {
  const { result, username } = req.body; // �q�ШD�餤���o�C�����G�A�i��O 'win' �� 'lose'

   // �ھڹC�����G��s��Ʈw�����ƾ�
  let updateQuery;
  if (result === 'win') {
    updateQuery = 'UPDATE users SET win = win + 1 WHERE username = ?';
  } else if (result === 'lose') {
    updateQuery = 'UPDATE users SET lose = lose + 1 WHERE username = ?';
  } else {
    res.status(400).json({ message: 'Invalid game result' });
    return;
  }

  // �����s��Ʈw�ާ@
  connection.query(updateQuery, [username] , (err, results) => {
    if (err) {
      console.error('Error updating database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // �^�Ǧ��\�^��
    res.status(200).json({ message: 'Results updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
