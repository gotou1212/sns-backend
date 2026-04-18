const { z } = require("zod");

const authSchema = z.object({
  username: z.string().trim().min(1, "usernameとpasswordが必要です。"),
  password: z.string().trim().min(1, "usernameとpasswordが必要です。"),
});

const postSchema = z.object({
  title: z.string().trim().min(1, "titleとcontentが必要です"),
  content: z.string().trim().min(1, "titleとcontentが必要です"),
});

function parsePostId(idParam) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = {
  authSchema,
  postSchema,
  parsePostId,
};
