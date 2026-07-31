export const parseMultipartJson = (fields = []) => (req, res, next) => {
  for (const field of fields) {
    if (typeof req.body[field] === "string") {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (_) {
        // leave it as-is so Joi can report the validation error
      }
    }
  }

  next();
};