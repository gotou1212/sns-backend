const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { authSchema, parseUserId } = require("../validators/schemas");

const router = express.Router();

router.post("/register", validateBody(authSchema), async (req, res) => {
  const { username, password } = req.validatedBody;

  try {
    const existingUser = await db.getAsync("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUser) {
      return res.status(409).json({ error: "ユーザーが既に存在します" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.runAsync(
      "INSERT INTO users(username, password) VALUES(?, ?)",
      [username, hashedPassword]
    );

    return res.status(201).json({ message: "ユーザー登録が完了しました" });
  } catch (err) {
    return res.status(500).json({ error: "ユーザー登録に失敗しました" });
  }
});

router.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await db.getAsync(
      "SELECT id, username FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "ユーザー取得に失敗しました" });
  }
});

router.get("/users/:id", async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: "idが不正です" });
  }

  try {
    const user = await db.getAsync(
      "SELECT id, username FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "ユーザー取得に失敗しました" });
  }
});

module.exports = router;
