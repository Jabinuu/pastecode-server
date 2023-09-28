const Router = require("koa-router");
const {
  getCodeComment,
  getUserComment,
  deleteUserComment,
} = require("../handlers/comment");
const { auth } = require("../middleware/auth.middleware");

const commentRoute = new Router({ prefix: "/comment" });
commentRoute.post("codeComment", "/codeComment", getCodeComment);
commentRoute.post("userComment", "/userComment", getUserComment);
commentRoute.post("deleteComment", "/deleteComment", auth, deleteUserComment);

module.exports = commentRoute;
