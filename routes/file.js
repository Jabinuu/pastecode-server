const Router = require("koa-router");
const { downloadCodeFile } = require("../handlers/file");
const fileRouter = new Router({ prefix: "/file" });
fileRouter.get("download", "/download/:codeId", downloadCodeFile);
module.exports = fileRouter;
