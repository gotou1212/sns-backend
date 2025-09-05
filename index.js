const express = require("express");
const app = express();
const port = 3000;
const db = require("./db");
app.use(express.json());


//ルーティング
app.get("/users",(req,res) => {
    res.json({
         message: "GET/users 実行されました",
       users:[
        {id: 1, name: "satou"},
        {id: 2, name: "tanaka"}
       ]
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

db.run("INSERT INTO posts(title,content)VALUES('satou','tanaka')",(err) => (
    console.log(err)
));
res.json({
    message: "作成しました"
   });
   
});

// TODO GET /users POST /users



//起動
app.listen(port, () => {
    console.log("start server");
})