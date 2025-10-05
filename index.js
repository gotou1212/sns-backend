const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");
const cors = require("cors");


app.use(express.json());
app.use(cors());

//ルーティング
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
// TODOポストの作業処理を書く
    db.run("INSERT INTO posts(title,content)VALUES('satou','tanaka')",(err) => (
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