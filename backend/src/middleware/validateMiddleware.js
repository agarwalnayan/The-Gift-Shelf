import ApiError from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return next(new ApiError(400, 'Validation failed', messages));
  }

  // Joi coerces types per the schema (e.g. FormData string "true"/"3" -> boolean/number).
  // Without reassigning req.body to the coerced value, controllers downstream
  // would keep receiving raw, uncoerced strings even though validation passed.
  req.body = value;

  next();
};