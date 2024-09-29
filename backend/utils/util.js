export const buildResponse = (res, statusCode, data) => {
  return res.status(statusCode).json(data);
};
