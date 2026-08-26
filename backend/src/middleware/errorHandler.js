export const errorHandler = (error, _request, response, _next) => {
  console.error(error);

  response.status(500).json({
    success: false,
    message: error.message,
  });
};