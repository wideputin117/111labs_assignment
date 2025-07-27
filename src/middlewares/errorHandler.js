import ApiError from "../utils/error/ApiError.js";

// Error handling  
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

   if (err.name === "ValidationError") {
    const message = `Validation Error: ${Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")}`;
    err = new ApiError(message, 400);
  }

   if (err.name === "CastError") {
    const message = `Resource not found with this ID. Invalid ${err.path}`;
    err = new ApiError(message, 400);
  }

   if (err.code === 11000) {
    const message = `Duplicate key error: ${Object.keys(err.keyValue).join(
      ", "
    )} already exists.`;
    err = new ApiError(message, 400);
  }

   if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    err = new ApiError(message, 401);
  }

   if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again.";
    err = new ApiError(message, 401);
  }

   console.error(err);

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
