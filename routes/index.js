const Router = require("koa-router");
const codeRoute = require("./code.js");
const commentRoute = require("./comment.js");
const userRoute = require("./user.js");
const favoriteRoute = require("./favorite.js");
const recommendRouter = require("./recommend.js");
const fileRouter = require("./file.js");
const router = new Router();
// 装载所有子路由
router.use(codeRoute.routes(), codeRoute.allowedMethods());
router.use(commentRoute.routes(), commentRoute.allowedMethods());
router.use(userRoute.routes(), userRoute.allowedMethods());
router.use(favoriteRoute.routes(), favoriteRoute.allowedMethods());
router.use(recommendRouter.routes(), recommendRouter.allowedMethods());
router.use(fileRouter.routes(), fileRouter.allowedMethods());
module.exports = router;
