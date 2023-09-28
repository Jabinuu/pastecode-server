const bcrypt = require("bcryptjs");
const { query } = require("../db");

const {
  userNotExist,
  userPwdNotCorrect,
  userLoginFail,
  changePasswordFail,
  registerExisted,
  registerFail,
} = require("../constant/err.type");

/**
 *
 * @param {*} ctx
 * @param {*} next
 * @description 验证用户名 邮箱 是否被注册过
 */
exports.verifyRegister = async (ctx, next) => {
  const { username, email } = ctx.request.body;
  try {
    const [res] = await query(
      `select * from user where username='${username}' or email='${email}'`
    );
    if (res) {
      return ctx.app.emit("error", registerExisted, ctx);
    }
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", registerFail, ctx);
  }
  await next();
};

/**
 *
 * @param {*} ctx
 * @param {*} next
 * @returns null
 * @description 数据库中用户密码加密中间件，将明文密码进行加密，密文存储在数据库
 * @author jiabin
 */
exports.encryptPassword = async (ctx, next) => {
  const { password, rePassword } = ctx.request.body;
  // 若两次输入代码不一致则结束流程并抛出异常
  if (rePassword !== password) {
    return ctx.app.emit("error", twoPasswordNotSame, ctx);
  }
  // 原密码加盐
  const salt = bcrypt.genSaltSync();
  // 对加盐后的密码加密
  const hash = bcrypt.hashSync(password, salt);
  ctx.request.body.password = hash;
  await next();
};

/**
 *
 * @param {*} ctx
 * @param {*} next
 * @returns null
 * @description 验证用户登录
 */
exports.verifyUser = async (ctx, next) => {
  const { password, username } = ctx.request.body;
  try {
    // 1.先判断用户名是否存在
    const [res] = await query(
      `select * from user where username='${username}'`
    );
    if (!res) {
      ctx.app.emit("error", userNotExist, ctx);
      // 用户名不存在直接,直接return,中止中间件流
      return;
    }
    // 2.再判断密码是否匹配
    if (!bcrypt.compareSync(password, res.password)) {
      ctx.app.emit("error", userPwdNotCorrect, ctx);
      return;
    }
  } catch (error) {
    return ctx.app.emit("error", userLoginFail, ctx);
  }
  await next();
};

/**
 *
 * @param {*} ctx
 * @param {*} next
 * @returns null
 * @description 对用于修改密码的数据进行验证
 * @author jiabin
 */
exports.changePasswordVerify = async (ctx, next) => {
  const { username, email, password, rePassword } = ctx.request.body;
  try {
    // 两次密码输入不一致的情况
    if (password !== rePassword) {
      return ctx.app.emit("error", twoPasswordNotSame, ctx);
    }
    const [res] = await query(
      `select * from user where username='${username}'`
    );
    // 用户名不存在的情况
    if (!res) {
      return ctx.app.emit("error", userNotExist, ctx);
    }
    if (email !== res.email) {
      // 邮箱不匹配的情况
      return ctx.app.emit("error", emailNotMatch, ctx);
    }
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", changePasswordFail, ctx);
  }
  await next();
};
