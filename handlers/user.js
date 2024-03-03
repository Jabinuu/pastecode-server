const { query } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secretKey, refreshTokenKey } = require("../config.default");
const {
  userLoginFail,
  changePasswordFail,
  registerFail,
  getUserInfoFail,
  changeProfileFail,
} = require("../constant/err.type");
const { changeResKey } = require("../utils/resHandler.js");

/**
 *
 * @param {*} ctx
 * @description 用户注册
 * @author jiabin
 */
exports.userRegister = async (ctx) => {
  const { username, password, email } = ctx.request.body;

  try {
    const [total] = await query("select count(*) as total from user");
    const value = {
      id: ++total.total,
      username,
      password,
      email,
      role: 1,
      favorite: "[]",
      avatar_url: "http://cdn.zutjlx.site/image/1672844542112.png",
      register_time: Date.now(),
      job: "在校生",
      location: "河南省/郑州市",
      hobby: "编程、羽毛球、健身",
      tel: "13760930687",
      introduction: "暂无",
    };
    const sql = `insert into user set ?`;
    await query(sql, value);
    ctx.body = {
      code: 100,
      msg: "注册成功!",
      data: {},
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", registerFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @returns null
 * @description 用户登录，仅仅返回用户的token！返回用户信息交给其他的接口做
 * @author jiabin
 */
exports.userLogin = async (ctx) => {
  const { username } = ctx.request.body;
  try {
    const [temp] = changeResKey(
      await query(`select * from user where username='${username}'`)
    );
    const res = {
      username: temp.username,
      id: temp.id,
    };
    ctx.body = {
      code: 100,
      msg: "登录成功!",
      data: {
        token: jwt.sign(res, secretKey, { expiresIn: 30 }), //数字单位为 秒
        refreshToken: jwt.sign({ token: "myrefreshToken" }, refreshTokenKey, {
          expiresIn: 60 * 60 * 24 * 15,
        }),
      },
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", userLoginFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @returns null
 * @description 更新短效token
 * @author jiabin
 */
exports.updateToken = async (ctx) => {
  const { username } = ctx.request.body;
  try {
    const [temp] = changeResKey(
      await query(`select * from user where username='${username}'`)
    );
    const res = {
      username: temp.username,
      id: temp.id,
    };
    ctx.body = {
      code: 100,
      msg: "token已更新!",
      data: {
        token: jwt.sign(res, secretKey, { expiresIn: 10 }), //数字单位为 秒
      },
    };
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param {*} ctx
 * @returns null
 * @description 修改用户密码
 * @author jiabin
 */
exports.userChangePassword = async (ctx) => {
  const { username, password } = ctx.request.body;
  try {
    await query("update user set ? where username=?", [
      { password: bcrypt.hashSync(password) },
      username,
    ]);
    ctx.body = {
      code: 100,
      msg: "密码修改成功!",
      data: {},
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", changePasswordFail, ctx);
  }
};

/**data
 * @param {*} ctx
 * @description 获取用户信息
 */
exports.sendUserInfo = async (ctx) => {
  const { id, iat, exp } = ctx.state;
  try {
    const [data] = changeResKey(
      await query(`select * from user where id=${id}`)
    );
    // 用扩展运算符剔除password等属性
    const { password, ...res } = data;
    Object.assign(res, { iat, exp });
    ctx.body = {
      code: 100,
      msg: "success!",
      data: res,
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", getUserInfoFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 修改个人信息
 * @author jiabin
 */
exports.changeProfile = async (ctx) => {
  const body = ctx.request.body;
  try {
    const { id, email, avatarUrl, introduction, tel, hobby, location, job } =
      body;
    const data = {
      email,
      avatar_url: avatarUrl,
      introduction,
      tel,
      hobby,
      location,
      job,
    };
    await query(`update user set ? where id=?`, [data, id]);
    ctx.body = {
      code: 100,
      msg: "个人信息修改成功!",
      data: {},
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", changeProfileFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 根据用户ID获取用户信息
 * @author jiabin
 */
exports.userInfoById = async (ctx) => {
  const { id } = ctx.request.body;
  try {
    const [data] = changeResKey(
      await query(`select * from user where id=${id}`)
    );
    const { password, ...res } = data;
    ctx.body = {
      code: 100,
      msg: "success",
      data: res,
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", getUserInfoFail, ctx);
  }
};
