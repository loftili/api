module.exports = function(req, res, next) {
  CorsHeaderService.add(req, res);
  next();
};
