const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

//ルーティング
app.get("/",(req,res) => {
    res.json({
         message: "hello, world!",
        massage2: "hello world! 3"
    });
});

//起動
app.listen(port, () => {
    console.log("start server");
})