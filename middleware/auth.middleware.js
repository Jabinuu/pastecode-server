const { tokenExpirationOver } = require("../constant/err.type");
const { secretKey } = require("../config.default");
const jwt = require("jsonwebtoken");
/**
 *
 * @param {*} ctx
 * @param {*} next
 * @returns null
 * @description 验证token有效性
 * @author jiabin
 */
exports.auth = async (ctx, next) => {
  const { authorization: token } = ctx.request.header;
  try {
    const data = jwt.verify(token, secretKey);
    ctx.state.id = data.id;
    ctx.state.iat = data.iat;
    ctx.state.exp = data.exp;
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", tokenExpirationOver, ctx);
  }
  await next();
};
