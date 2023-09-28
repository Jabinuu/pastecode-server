const { query } = require("../db");
const { changeResKey } = require("../utils/resHandler");
const {
  getFavoriteFail,
  addFavoriteFail,
  duplicateFavorite,
  quitFavoriteFail,
} = require("../constant/err.type");

/**
 *
 * @param {*} ctx
 * @description 获取用户收藏
 * @author jiabin
 */
exports.getFavoriteCode = async function (ctx) {
  try {
    const { id } = ctx.request.body;
    const [data] = await query(`select favorite from user where id=${id}`);
    const favoArr = JSON.parse(data.favorite);
    let res = favoArr.map(async (elem) => {
      const [tt] = changeResKey(
        await query(`select * from code where id=${elem}`)
      );
      const {
        title,
        content,
        author,
        date,
        size,
        viewNum,
        commentNum,
        lang,
        id,
        codeId,
      } = tt;
      return {
        title,
        content,
        author,
        date,
        size,
        viewNum,
        commentNum,
        lang,
        id,
        codeId,
      };
    });
    res = await Promise.all(res);
    ctx.body = {
      code: 100,
      msg: "success!",
      data: res,
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", getFavoriteFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 添加用户收藏
 * @author jiabin
 */
exports.addFavorite = async function (ctx) {
  const { uid, cid } = ctx.request.body;
  try {
    const [data] = await query(`select favorite from user where id=${uid}`);
    const favoArr = JSON.parse(data.favorite);
    favoArr.push(parseInt(cid));
    if (favoArr.length !== Array.from(new Set(favoArr)).length) {
      return ctx.app.emit("error", duplicateFavorite, ctx);
    }
    await query(
      `update user set favorite='${JSON.stringify(favoArr)}' where id=${uid}`
    );
    ctx.body = {
      code: 100,
      msg: "success!",
      data: {},
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", addFavoriteFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 取消代码收藏
 * @author jiabin
 */
exports.quitFavorite = async (ctx) => {
  const { uid, cid } = ctx.request.body;
  try {
    const [data] = await query(`select favorite from user where id=${uid}`);
    const favoArr = JSON.parse(data.favorite);
    favoArr.splice(favoArr.indexOf(parseInt(cid)), 1);
    console.log(favoArr);
    await query(
      `update user set favorite='${JSON.stringify(favoArr)}' where id=${uid}`
    );
    ctx.body = {
      code: 100,
      msg: "success",
      data: {},
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", quitFavoriteFail, ctx);
  }
};
