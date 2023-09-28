module.exports = function errHandeler(err, ctx) {
  let status = 200;
  ctx.status = status;
  ctx.body = err;
};
