const express = require("express");
const cors = require("cors");

require("./db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

const app = express();

app.use(express.json());
app.use(cors());
// TODO デプロイしたら許可リストを設定する

app.use(authRoutes);
app.use(userRoutes);
app.use(postRoutes);

module.exports = app;
