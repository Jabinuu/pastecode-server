const Router = require("koa-router");
const { getRecommendList } = require("../handlers/recommend");
const recommendRouter = new Router({ prefix: "/recommend" });

recommendRouter.get("list", "/list", getRecommendList);

module.exports = recommendRouter;
