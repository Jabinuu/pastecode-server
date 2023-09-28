const { getRecommendListFail } = require("../constant/err.type");
const { changeResKey } = require("../utils//resHandler.js");
const { query } = require("../db/index");
/**
 *
 * @param {*} ctx
 * @description 获取推荐代码列表
 * @author jiabin
 */
exports.getRecommendList = async (ctx) => {
  try {
    let sql = "select * from code order by rand() limit 7"; // 随机抽取7个数据项
    console.log(sql);
    const data = changeResKey(await query(sql));
    ctx.body = {
      data: 100,
      msg: "success",
      data,
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", getRecommendListFail, ctx);
  }
};
