export function successResponse(res, data, message = 'Success', code = 200) {
  return res.status(code).json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function errorResponse(res, message = 'Internal Server Error', code = 500, details = null) {
  return res.status(code).json({
    status: 'error',
    message,
    details,
    timestamp: new Date().toISOString(),
  });
}
