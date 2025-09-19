const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");
app.use(express.json());


//ルーティング
app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
        res.json({
            message: "GET /users 実行されました",
            users: rows
        });
    });
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