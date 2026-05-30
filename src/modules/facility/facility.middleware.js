// ─── Validation Middleware ────────────────────────────────────────────────────
const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({ body: req.body });
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
  };
};

// ─── Central Error Handler ────────────────────────────────────────────────────
// app.js এ সব route এর পরে এটা use করতে হবে:
// app.use(errorHandler)
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// app.js এ সব route এর পরে, errorHandler এর আগে use করো:
// app.use(notFoundHandler)
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
};

module.exports = { validateRequest, errorHandler, notFoundHandler };
