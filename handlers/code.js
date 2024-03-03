const {
  createCodeFail,
  deleteUserCodeFail,
  changeCodeFail,
  getSingleCodeFail,
  codepwWrong,
} = require("../constant/err.type");
// const fs = require("fs");
// const path = require("path");
// const { extname } = require("../constant/extname");
const { query } = require("../db");
const { changeResKey } = require("../utils/resHandler");
const uuid = require("../utils/uuid");
const { computeContentBytes } = require("../utils/computeContentBytes");
const bcrypt = require("bcryptjs");

/**
 *
 * @param {string[]} languages
 * @param {string} kw
 * @returns 用于筛选数据的where子句
 * @description 计算用于筛选数据的where子句
 * @author jiabin
 */
function computeSubSql(languages, kw) {
  let subSql = "";
  if (!languages && kw === "") {
    return subSql;
  }
  if (languages.length !== 0 && kw !== "") {
    // 既有筛选又有搜索
    languages.forEach((elem) => (subSql += `lang='${elem}' or `));
    subSql = subSql.slice(0, -4);
    subSql = "(".concat(subSql, `) and title like '%${kw}%'`);
  } else if (languages.length === 0 && kw !== "") {
    // 只有搜索没有筛选
    subSql = subSql.concat(`title like '%${kw}%'`);
  } else if (languages.length !== 0 && kw === "") {
    //只有筛选没有搜索
    languages.forEach((elem) => (subSql += `lang='${elem}' or `));
    subSql = subSql.slice(0, -4);
  }
  return subSql;
}

/**
 *
 * @param {string} order
 * @param {*} ctx
 * @returns 符合筛选条件的总条数和当前分页的数据
 * @description 获取已排序的当前分页代码列表和总数目
 * @author jiabin
 */
async function getOrderdList(order, ctx) {
  let post = ctx.request.body;
  let { kw, languages, pn, ps } = post;
  let countSql = "select count(*) as total from code ";
  let sql = `select title,expiration,encrypt,id,author,lang,category,date,size,view_num,exposure,comment_num,content,code_id from code order by ${order} desc`;
  if (languages.length !== 0 || kw !== "") {
    let subSql = computeSubSql(languages, kw);
    sql = `select title,expiration,encrypt,id,author,lang,category,date,size,view_num,exposure,comment_num,content,code_id from code where ${subSql} order by ${order} desc`;
    countSql = `select count(*) as total from code where ${subSql}`;
  }
  sql += ` limit ${(pn - 1) * ps},${ps}`; // limit 子句实现分页
  console.log(sql);
  const list = changeResKey(await query(sql));
  const total = await query(countSql);
  return {
    total: total[0].total,
    codeList: list,
  };
}

/**
 *
 * @param {string} ori
 * @returns 加密后的密码
 * @description 对代码访问密码进行加密
 * @author jiabin
 */
function genEncryptCodepw(ori) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(ori, salt);
}

/**
 *
 * @param {*} ctx
 * @description 最热，按浏览量viewNum降序排序
 * @author jiabin
 */
exports.getHotlist = async (ctx) => {
  const data = await getOrderdList("view_num", ctx);
  ctx.body = {
    code: 100,
    msg: "success",
    data,
  };
};

/**
 *
 * @param {*} ctx
 * @description 最新，按创建日期时间戳降序排序
 * @author jiabin
 */
exports.getNewlist = async (ctx) => {
  const data = await getOrderdList("date", ctx);
  ctx.body = {
    code: 100,
    msg: "success",
    data,
  };
};

/**
 *
 * @param {*} ctx
 * @description 精选，按quality字段筛选
 * @author jiabin
 */
exports.getQualitylist = async (ctx) => {
  let post = ctx.request.body;
  let { kw, languages, pn, ps } = post;
  let countSql = "select count(*) as total from code where quality=1";
  let sql = "select * from code where quality=1";
  if (languages.length !== 0 || kw !== "") {
    subSql = computeSubSql(languages, kw);
    sql = `select * from code where quality=1 and (${subSql})`;
    countSql = `select count(*) as total from code where quality=1 and (${subSql}) `;
  }
  sql += ` limit ${(pn - 1) * ps},${ps}`; // limit 子句实现分页
  console.log(sql);
  const qualitylist = changeResKey(await query(sql));
  const total = await query(countSql);
  ctx.body = {
    code: 100,
    msg: "success",
    data: {
      total: total[0].total,
      codeList: qualitylist,
    },
  };
};

/**
 *
 * @param {*} ctx
 * @description 根据id获取单个代码信息
 * @author jiabin
 */
exports.getCodeById = async (ctx) => {
  const { codeId, isCount } = ctx.request.body;
  try {
    if (codeId) {
      let sql = `select * from code where code_id='${codeId}'`;
      console.log(sql);
      const [data] = changeResKey(await query(sql));
      ctx.body = {
        data: 100,
        msg: "success",
        data,
      };
      if (isCount) {
        await query(
          `update code set view_num=${
            data.viewNum + 1
          } where code_id='${codeId}'`
        );
      }
    }
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", getSingleCodeFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @description 创建新的代码
 * @author jiabin
 */
exports.createCode = async (ctx) => {
  let {
    title,
    author,
    expiration,
    encrypt,
    exposure,
    category,
    lang,
    content,
    codepw,
    uid,
  } = ctx.request.body;
  try {
    const [total] = await query("select count(*) as total from code");
    const codeId = uuid();
    const raw = "http://localhost:3000/files/" + codeId + ".cpp";
    const newData = {
      title,
      author: author || "游客1",
      uid: uid || 0,
      expiration,
      encrypt,
      exposure,
      category,
      lang,
      content,
      codepw: genEncryptCodepw(codepw),
      id: total.total + 1,
      date: Date.now(),
      size: computeContentBytes(content),
      view_num: 0,
      comment_num: 0,
      quality: 0,
      code_id: codeId,
      raw,
    };

    // const pp = path.join(
    //   __dirname,
    //   "../files/",
    //   `${codeId}${extname[lang === "C/C++" ? "C" : lang]}`
    // );
    let sql = "insert into code set ?";
    // fs.writeFileSync(pp, content);
    // newData.size = fs.statSync(pp).size;
    await query(sql, newData);
    ctx.body = {
      code: 100,
      msg: "success",
      data: {
        codeId,
      },
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", createCodeFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @returns 修改结果成功与否
 * @description 在个人中心中，修改用户代码
 * @author jiabin
 */
exports.changeUserCode = async function (ctx) {
  const { title, lang, codepw, encrypt, category, content, codeId, exposure } =
    ctx.request.body;

  try {
    const changeValue = {
      title,
      lang,
      codepw: genEncryptCodepw(codepw),
      encrypt,
      category,
      content,
      exposure,
    };
    await query(`update code set ? where code_id='${codeId}'`, changeValue);
    ctx.body = {
      code: 100,
      msg: "success",
      data: {},
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", changeCodeFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @returns 代码删除是否成功
 * @description 删除用户代码
 * @
 */
exports.deleteUserCode = async function (ctx) {
  const { codeId } = ctx.request.body;
  try {
    await query(`delete from code where code_id='${codeId}'`);
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

/**
 *
 * @param {*} ctx
 * @description 获取用户发表的代码列表
 * @author jiabin
 */
exports.getUserCode = async (ctx) => {
  try {
    const { id, kw, languages, ps, pn } = ctx.request.body;
    const whereOpt = computeSubSql(languages, kw);
    console.log(whereOpt);
    const subSql = whereOpt.length === 0 ? "" : ` and (${whereOpt})`;
    let sql = `select * from code where uid=${id}` + subSql;
    const countsSql = sql.replace("*", "count(*) as total");
    const [total] = await query(countsSql);
    sql += ` limit ${(pn - 1) * ps},${ps}`;
    console.log(sql);
    const data = changeResKey(await query(sql));
    const res = data.map((elem) => {
      const {
        codeId,
        title,
        author,
        lang,
        content,
        date,
        link,
        category,
        encrypt,
        exposure,
        codepw,
      } = elem;
      return {
        codeId,
        title,
        author,
        encrypt,
        lang,
        content,
        date,
        link,
        category,
        exposure,
        codepw,
      };
    });
    ctx.body = {
      code: 100,
      msg: "success",
      data: {
        total: total.total,
        codes: res,
      },
    };
  } catch (e) {
    console.error(e);
    ctx.app.emit("error", getUserCodeFail, ctx);
  }
};

/**
 *
 * @param {*} ctx
 * @returns 访问密码是否正确
 * @author jiabin
 */
exports.verifyCodepw = async (ctx) => {
  const { codepw, codeId } = ctx.request.body;
  try {
    const [data] = await query(`select * from code where code_id='${codeId}'`);
    if (!bcrypt.compareSync(codepw, data.codepw)) {
      return ctx.app.emit("error", codepwWrong, ctx);
    }
    ctx.body = {
      code: 100,
      msg: "success",
      data: {},
    };
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", codepwWrong, ctx);
  }
};
