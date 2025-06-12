const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate entry",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
};

module.exports = errorHandler;
