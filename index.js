const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");
app.use(express.json());

//ルーティング
app.get("/",(req,res) => {
    res.json({
         message: "hello, world!",
        massage2: "hello world! 3"
    });
});


app.get("/posts",(req,res) => {
    db.all("SELECT * FROM posts",(err,rows) => {
       console.log(err)
       console.log(rows)
})
});

app.post("/posts",(req,res)=> {
// TODOポストの作業処理を書く

db.run("INSERT INTO posts(title,content)VALUES('moji','moji2')",(err) => (
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