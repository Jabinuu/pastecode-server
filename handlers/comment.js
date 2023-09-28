const {
  getCodeCommentFail,
  getUserCommentFail,
  deleteUserCodeFail,
} = require("../constant/err.type");
const { query } = require("../db/index");
const { changeResKey } = require("../utils/resHandler");
/**
 *
 * @param {*} ctx
 * @description 获取某个代码下的所有评论
 * @author jiabin
 */
exports.getCodeComment = async (ctx) => {
  try {
    const { cid } = ctx.request.body;
    const [res] = await query(`select id from code where code_id='${cid}'`);
    let commentData = await query(`select * from comment where cid=${res.id}`);
    commentData = commentData.map(async (elem) => {
      const userSql = `select username,avatar_url from user where id=${elem.uid}`;
      const [userData] = changeResKey(await query(userSql));
      delete elem.cid;
      delete elem.uid;
      return Object.assign(elem, userData);
    });
    //promise.all()的典型应用! 在map等循环中使用await，那么map()始终返回一个promise数组，要用promise.all等待所有promise解决
    const data = await Promise.all(commentData);
    ctx.body = {
      code: 100,
      msg: "success",
      data,
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", getCodeCommentFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 获取某个用户发表的所有评论
 * @author jiabin
 */
exports.getUserComment = async (ctx) => {
  const { uid } = ctx.request.body;
  const sql = `select id,content,date,cid from comment where uid=${uid}`;
  try {
    let data = await query(sql);
    data = data.map(async (elem) => {
      const [codeData] = changeResKey(
        await query(
          `select author,code_id,title from code where id=${elem.cid}`
        )
      );
      elem.author = codeData.author;
      elem.codeId = codeData.codeId;
      elem.title = codeData.title;
      delete elem.cid;
      return elem;
    });
    const res = await Promise.all(data);
    ctx.body = {
      code: 100,
      msg: "success",
      data: res,
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", getUserCommentFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 删除用户评论
 * @author jiabin
 */
exports.deleteUserComment = async (ctx) => {
  const { id } = ctx.request.body;
  try {
    await query(`delete from comment where id=${id}`);
    ctx.body = {
      code: 100,
      msg: "success",
      data: {},
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", deleteUserCodeFail, ctx);
  }
};
