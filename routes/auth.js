const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_EXPIRES_IN, SECRET_KEY } = require("../config/auth");
const { validateBody } = require("../middleware/validate");
const { authSchema } = require("../validators/schemas");

const router = express.Router();

router.post("/login", validateBody(authSchema), async (req, res) => {
  const { username, password } = req.validatedBody;

  try {
    const user = await db.getAsync("SELECT * FROM users WHERE username = ?", [username]);

    if (!user) {
      return res.status(400).json({ error: "ユーザーが見つかりません" });
    }

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
  } catch (err) {
    return res.status(500).json({ error: "認証処理でエラーが発生しました" });
  }
});

module.exports = router;
