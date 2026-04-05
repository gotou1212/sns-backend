const express = require("express");
const app = express();
const db = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
app.use(express.json());
app.use(cors());
//TODO デプロイしたら許可リストを設定する
const port = Number(process.env.PORT) || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePostId(idParam) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

//ルーティング
//ログインAPI

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "usernameとpasswordが必要です。" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "データベースエラー" });
    }
    
    if (!user) {
      return res.status(400).json({ error: "ユーザーが見つかりません" });
    }

    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: "パスワードが正しくありません。" });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return res.status(200).json({ token });
    } catch (authErr) {
      return res.status(500).json({ error: "認証処理でエラーが発生しました" });
    }
  });
});

//ユーザー登録API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "usernameとpasswordが必要です。" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "データベースエラー" });
    }
    
    if (user) {
      return res.status(400).json({ error: "ユーザーが既に存在します" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO users(username, password) VALUES(?, ?)",
        [username.trim(), hashedPassword],
        (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ error: "ユーザー登録に失敗しました" });
          }
          return res.status(201).json({ message: "ユーザー登録が完了しました" });
        }
      );
    } catch (hashErr) {
      return res.status(500).json({ error: "パスワード処理でエラーが発生しました" });
    }
  });
});

// 認証ミドルウェア
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "tokenが必要です。" });
  }
  //403 認可エラー
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Bearer token形式で指定してください。" });
  }
  
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
    db.all("SELECT * FROM posts ORDER BY id DESC", (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json(rows);
    });
});

//投稿作成API
app.post("/posts", authMiddleware, (req, res) => {
  const { title, content } = req.body;

  if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
    return res.status(400).json({ error: "titleとcontentが必要です" });
  }

  db.run(
    "INSERT INTO posts(title,content)VALUES(?,?)",
    [title.trim(), content.trim()],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "作成に失敗しました" });
      }

      return res.status(201).json({
        message: "作成しました",
        postId: this.lastID,
      });
    }
  );
});
  //投稿更新API
  app.put("/posts/:id", authMiddleware, (req, res) => {
    const postId = parsePostId(req.params.id);
    const { title, content } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "idが不正です" });
    }

    if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
      return res.status(400).json({ error: "titleとcontentが必要です" });
    }

    db.run("UPDATE posts SET title = ?, content = ? WHERE id = ?", [title.trim(), content.trim(), postId], function(err) {
      if (err) {
        return res.status(500).json({ error: "更新に失敗しました" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "投稿が見つかりません" });
      }

      return res.json({ message: "更新しました" });
    });
  });
//投稿削除API
//　posts/1
app.delete("/posts/:id", authMiddleware, (req, res) => {
    const postId = parsePostId(req.params.id);

    if (!postId) {
      return res.status(400).json({ error: "idが不正です" });
    }

    db.run("DELETE FROM posts WHERE id = ?", [postId], function (err) {
      if (err) {
        return res.status(500).json({ error: "削除に失敗しました" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "投稿が見つかりません" });
      }

      return res.json({
        message:"削除しました"
      });
    });
});
//起動
app.listen(port, () => {
    console.log(`start server on port ${port}`);
});