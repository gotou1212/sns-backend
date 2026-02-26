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
  console.log(username);

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err,user) => {
    if (!user) {
      return res.status(400).json({error:"パスワードが正しくありません。"});
    }

    //ログイン処理
        const ispasswordvalid = await bcrypt.compare(password,10);
       
        if (!ispasswordvaild){
            return res.status(400).json({ error: "パスワードが正しくありません。"})
        }
       //トークン発行
       const tokwn = jwt.sign({username}. SECRET_KEY);
            
        });
    });
    
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