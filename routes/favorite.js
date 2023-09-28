const Router = require("koa-router");
const {
  getFavoriteCode,
  addFavorite,
  quitFavorite,
} = require("../handlers/favorite");
const { auth } = require("../middleware/auth.middleware");

const favoriteRoute = new Router({ prefix: "/favorite" });

favoriteRoute.post("list", "/list", auth, getFavoriteCode);
favoriteRoute.post("add", "/add", addFavorite);
favoriteRoute.post("quit", "/quit", quitFavorite);
module.exports = favoriteRoute;
