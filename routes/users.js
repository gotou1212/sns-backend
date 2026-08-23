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

router.get("/users/:userId/follow-summary", authMiddleware, async (req, res) => {
  const targetUserId = parseUserId(req.params.userId);

  if (!targetUserId) {
    return res.status(400).json({ error: "idが不正です" });
  }

  try {
    const targetUser = await db.getAsync("SELECT id FROM users WHERE id = ?", [targetUserId]);

    if (!targetUser) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    const [followersCountRow, followingCountRow, isFollowingRow] = await Promise.all([
      db.getAsync("SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?", [targetUserId]),
      db.getAsync("SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?", [targetUserId]),
      db.getAsync(
        "SELECT 1 AS found FROM follows WHERE follower_id = ? AND followee_id = ?",
        [req.user.userId, targetUserId]
      ),
    ]);

    return res.json({
      userId: targetUserId,
      followersCount: Number(followersCountRow?.count || 0),
      followingCount: Number(followingCountRow?.count || 0),
      isFollowing: Boolean(isFollowingRow),
    });
  } catch (err) {
    return res.status(500).json({ error: "フォロー情報取得に失敗しました" });
  }
});

router.post("/users/:userId/follow", authMiddleware, async (req, res) => {
  const targetUserId = parseUserId(req.params.userId);

  if (!targetUserId) {
    return res.status(400).json({ error: "idが不正です" });
  }

  if (targetUserId === req.user.userId) {
    return res.status(400).json({ error: "自分自身をフォローすることはできません" });
  }

  try {
    const targetUser = await db.getAsync("SELECT id FROM users WHERE id = ?", [targetUserId]);

    if (!targetUser) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    await db.runAsync(
      "INSERT OR IGNORE INTO follows(follower_id, followee_id) VALUES(?, ?)",
      [req.user.userId, targetUserId]
    );

    const followersCountRow = await db.getAsync(
      "SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?",
      [targetUserId]
    );

    return res.json({
      ok: true,
      isFollowing: true,
      followersCount: Number(followersCountRow?.count || 0),
    });
  } catch (err) {
    return res.status(500).json({ error: "フォローに失敗しました" });
  }
});

router.delete("/users/:userId/follow", authMiddleware, async (req, res) => {
  const targetUserId = parseUserId(req.params.userId);

  if (!targetUserId) {
    return res.status(400).json({ error: "idが不正です" });
  }

  if (targetUserId === req.user.userId) {
    return res.status(400).json({ error: "自分自身のフォローを解除することはできません" });
  }

  try {
    const targetUser = await db.getAsync("SELECT id FROM users WHERE id = ?", [targetUserId]);

    if (!targetUser) {
      return res.status(404).json({ error: "ユーザーが見つかりません" });
    }

    await db.runAsync(
      "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?",
      [req.user.userId, targetUserId]
    );

    const followersCountRow = await db.getAsync(
      "SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?",
      [targetUserId]
    );

    return res.json({
      ok: true,
      isFollowing: false,
      followersCount: Number(followersCountRow?.count || 0),
    });
  } catch (err) {
    return res.status(500).json({ error: "フォロー解除に失敗しました" });
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
