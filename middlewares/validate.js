// middlewares/validate.js
const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      // you can attach validated to request if needed
      req.validated = validated;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: err.errors
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
