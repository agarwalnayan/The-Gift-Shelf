import ApiError from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  // Parse JSON fields sent through multipart/form-data
  if (typeof req.body.announcement === 'string') {
    try {
      req.body.announcement = JSON.parse(req.body.announcement);
    } catch (err) {
      // Ignore, Joi will report validation error
    }
  }

  if (typeof req.body.featuredProducts === 'string') {
    try {
      req.body.featuredProducts = JSON.parse(req.body.featuredProducts);
    } catch (err) {
      // Ignore, Joi will report validation error
    }
  }

  if (typeof req.body.featuredCollections === 'string') {
    try {
      req.body.featuredCollections = JSON.parse(req.body.featuredCollections);
    } catch (err) {
      // Ignore, Joi will report validation error
    }
  }

  // Convert empty string to null for optional ObjectId fields
  if (req.body.upcomingFestival === '') {
    req.body.upcomingFestival = null;
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return next(new ApiError(400, 'Validation failed', messages));
  }

  // Preserve Joi's coerced values
  req.body = value;

  next();
};