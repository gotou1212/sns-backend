const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const bcrypt =require("bcrypt");
app.use(express.json());
app.use(cors());

const SECRET_KEY = "secret"

//ルーティング
//ログインAPI

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "usernameとpasswordが必要です。" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "データベースエラー" });
    }
    
    if (!user) {
      return res.status(400).json({ error: "ユーザーが見つかりません" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: "パスワードが正しくありません。" });
    }
    
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.status(200).json({ token });
  });
});

//ユーザー登録API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "usernameとpasswordが必要です。" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "データベースエラー" });
    }
    
    if (user) {
      return res.status(400).json({ error: "ユーザーが既に存在します" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run("INSERT INTO users(username, password) VALUES(?, ?)", 
      [username, hashedPassword], 
      (err) => {
        if (err) {
          return res.status(500).json({ error: "ユーザー登録に失敗しました" });
        }
        return res.status(201).json({ message: "ユーザー登録が完了しました" });
      }
    );
  });
});

// 認証ミドルウェア
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "tokenが必要です。" });
  }
  
  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: "tokenが無効です。" });
  }
}
//投稿一覧取得API
app.get("/posts", (req, res) => {
    db.all("SELECT * FROM posts", (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(rows);
    });
});

app.post("/users", (req,res) => {
    console.log("test");
    db.run("INSERT INTO users(username) VALUES('satousan')",(err) => (
        console.log(err)
    ))
});
//投稿作成API
app.post("/posts",(req,res)=> {
   const { title,content } = req.body;

    const createPostData = {
        title: title,
        content: content
    }
    db.run("INSERT INTO posts(title,content)VALUES(?,?)",[createPostData.title,createPostData.content],(err) => (
        console.log(err)
    ));
//投稿削除API
    res.json({
        message: "作成しました"
   });
});
//投稿削除API
//　posts/1
app.delete("/posts/:id",(req,res) => {
    const postId = req.params.id;

    db.run("DELETE FROM posts WHERE id = ?",[postId],(err) => {
    })

    res.json({
        message:"削除しました"
    })
})
//起動
app.listen(port, () => {
    console.log("start server");
})