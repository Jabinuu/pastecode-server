const Koa = require("koa");
const path = require("path");
const bodyParser = require("koa-bodyparser");
const route = require("./routes/index");
const errHandler = require("./utils/errHandler");
const KoaStatic = require("koa-static");
const app = new Koa();

app.use(bodyParser());
app.use(route.routes()).use(route.allowedMethods());
app.use(KoaStatic(path.join(__dirname, "./")));
app.on("error", errHandler);
app.listen(3000, () => {
  console.log("codepaste-server is starting at port 3000");
});
