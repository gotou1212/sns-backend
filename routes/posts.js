const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { parsePostId, postSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/posts", async (req, res) => {
  try {
    const rows = await db.allAsync(
      `SELECT posts.id, posts.title, posts.content, posts.user_id, users.username
       FROM posts
       LEFT JOIN users ON users.id = posts.user_id
       ORDER BY posts.id DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/posts", authMiddleware, validateBody(postSchema), async (req, res) => {
  const { title, content } = req.validatedBody;

  try {
    const result = await db.runAsync(
      "INSERT INTO posts(title, content, user_id) VALUES(?, ?, ?)",
      [title, content, req.user.userId]
    );

    return res.status(201).json({
      message: "作成しました",
      postId: result.lastID,
    });
  } catch (err) {
    return res.status(500).json({ error: "作成に失敗しました" });
  }
});

router.put("/posts/:id", authMiddleware, validateBody(postSchema), async (req, res) => {
  const postId = parsePostId(req.params.id);
  const { title, content } = req.validatedBody;

  if (!postId) {
    return res.status(400).json({ error: "idが不正です" });
  }

  try {
    const post = await db.getAsync("SELECT id, user_id FROM posts WHERE id = ?", [postId]);

    if (!post) {
      return res.status(404).json({ error: "投稿が見つかりません" });
    }

    if (post.user_id !== req.user.userId) {
      return res.status(403).json({ error: "この投稿を更新する権限がありません" });
    }

    await db.runAsync(
      "UPDATE posts SET title = ?, content = ? WHERE id = ?",
      [title, content, postId]
    );

    return res.json({ message: "更新しました" });
  } catch (err) {
    return res.status(500).json({ error: "更新に失敗しました" });
  }
});

router.delete("/posts/:id", authMiddleware, async (req, res) => {
  const postId = parsePostId(req.params.id);

  if (!postId) {
    return res.status(400).json({ error: "idが不正です" });
  }

  try {
    const post = await db.getAsync("SELECT id, user_id FROM posts WHERE id = ?", [postId]);

    if (!post) {
      return res.status(404).json({ error: "投稿が見つかりません" });
    }

    if (post.user_id !== req.user.userId) {
      return res.status(403).json({ error: "この投稿を削除する権限がありません" });
    }

    await db.runAsync("DELETE FROM posts WHERE id = ?", [postId]);

    return res.json({ message: "削除しました" });
  } catch (err) {
    return res.status(500).json({ error: "削除に失敗しました" });
  }
});

module.exports = router;
