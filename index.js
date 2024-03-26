// backend.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(cors()); // 使用 CORS 跨域套件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 虛擬的用戶資料，實際應用中需要存儲在數據庫中
/*const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' }
];*/

// MySQL 數據庫連接
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test' // 替換為您的數據庫名稱
});

// 連接到 MySQL 數據庫
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// 登錄路由
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 在?据?中查找用?
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // 如果找到用?，表示登?成功
    if (results.length > 0) {
      res.status(200).json({ message: 'login success' });
    } else {
      res.status(401).json({ message: 'account or password wrong' });
    }
  });
});


app.get('/results', (req, res) => {
  // 在這裡編寫從資料庫中檢索勝負結果資料的程式碼
   // 假設 'win' 和 'lose' 是資料庫中的欄位名
   // 從資料庫中查詢 'win' 和 'lose' 的值，並將其作為 JSON 資料傳回客戶端

  const username = req.query.username; // ?取?求中的用?名??

  const query = 'SELECT win, lose, username FROM users WHERE username = ?'; // 使用 WHERE 子句指定用?名
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    if (results.length > 0) {
      // 如果找到了用?，???果?送回客?端
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: 'Results not found' });
    }
  });
});






// '/update-results' 路由，用於更新勝負結果數據
app.post('/update-results', (req, res) => {
  const { result, username } = req.body; // 從請求體中取得遊戲結果，可能是 'win' 或 'lose'

   // 根據遊戲結果更新資料庫中的數據
  let updateQuery;
  if (result === 'win') {
    updateQuery = 'UPDATE users SET win = win + 1 WHERE username = ?';
  } else if (result === 'lose') {
    updateQuery = 'UPDATE users SET lose = lose + 1 WHERE username = ?';
  } else {
    res.status(400).json({ message: 'Invalid game result' });
    return;
  }

  // 執行更新資料庫操作
  connection.query(updateQuery, [username] , (err, results) => {
    if (err) {
      console.error('Error updating database:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    // 回傳成功回應
    res.status(200).json({ message: 'Results updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
