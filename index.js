const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken")

app.use(express.json());
app.use(cors());

const SECRET_KEY = "secret"

//ルーティング
app.post("/login",(req,res) => {
    
    const { username,password } = req.body;

    if (username === "admin" && password === "password"){
        return res.json({
            token: "token"
        })
    } else {
        return res.status(401).json({ error: "Error" });
    }
});

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

app.post("/posts",(req,res)=> {
   const { title,content } = req.body;

    const createPostData = {
        title: title,
        content: content
    }
    db.run("INSERT INTO posts(title,content)VALUES(?,?)",[createPostData.title,createPostData.content],(err) => (
        console.log(err)
    ));

    res.json({
        message: "作成しました"
   });
});

//起動
app.listen(port, () => {
    console.log("start server");
})