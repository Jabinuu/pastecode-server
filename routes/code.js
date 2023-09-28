const Router = require("koa-router");
const {
  getHotlist,
  getNewlist,
  getQualitylist,
  getCodeById,
  createCode,
  changeUserCode,
  deleteUserCode,
  getUserCode,
  verifyCodepw,
} = require("../handlers/code");
const { auth } = require("../middleware/auth.middleware");

// 定义子路由
const codeRoute = new Router({ prefix: "/code" });
codeRoute.post("hot", "/hotlist", getHotlist);
codeRoute.post("new", "/newlist", getNewlist);
codeRoute.post("quality", "/qualitylist", getQualitylist);
codeRoute.post("single", "/single", getCodeById);
codeRoute.post("create", "/create", createCode);
codeRoute.patch("changeCode", "/changeCode", auth, changeUserCode);
codeRoute.post("deleteCode", "/deleteCode", auth, deleteUserCode);
codeRoute.post("userCode", "/userCode", auth, getUserCode);
codeRoute.post("verify", "/verify", verifyCodepw);
module.exports = codeRoute;
