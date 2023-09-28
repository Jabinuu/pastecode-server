const Router = require("koa-router");
const {
  userRegister,
  userLogin,
  userChangePassword,
  sendUserInfo,
  changeProfile,
  userInfoById,
} = require("../handlers/user");
const {
  encryptPassword,
  verifyUser,
  changePasswordVerify,
  verifyRegister,
} = require("../middleware/user.middleware.js");

const { auth } = require("../middleware/auth.middleware");
const userRoute = new Router({ prefix: "/user" });

userRoute.post(
  "register",
  "/register",
  verifyRegister,
  encryptPassword,
  userRegister
);
userRoute.post("login", "/login", verifyUser, userLogin);
userRoute.patch("change", "/change", changePasswordVerify, userChangePassword);
userRoute.get("userInfo", "/userInfo", auth, sendUserInfo);
userRoute.patch("changeProfile", "/changeProfile", auth, changeProfile);
userRoute.post("userInfoById", "/userInfoById", userInfoById);
module.exports = userRoute;
