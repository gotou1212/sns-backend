function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return res.status(400).json({ error: firstIssue?.message || "リクエストが不正です" });
    }

    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  validateBody,
};
