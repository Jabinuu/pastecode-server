const Router = require("koa-router");
const {
  getCodeComment,
  getUserComment,
  deleteUserComment,
  addCodeComment,
} = require("../handlers/comment");
const { auth } = require("../middleware/auth.middleware");

const commentRoute = new Router({ prefix: "/comment" });
commentRoute.post("codeComment", "/codeComment", getCodeComment);
commentRoute.post("userComment", "/userComment", getUserComment);
commentRoute.post("deleteComment", "/deleteComment", auth, deleteUserComment);
commentRoute.post("addComment", "/addComment", auth, addCodeComment);
module.exports = commentRoute;
