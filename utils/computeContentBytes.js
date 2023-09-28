// exports.computeContentBytes = function (content) {
//   const strArr = content.split("");
//   const bytes = strArr.reduce((pre, cur) => {
//     return pre + cur.charCodeAt().toString(2).length;
//   }, 0);
//   return bytes / 8;
// };
exports.computeContentBytes = function (content) {
  return content.replace(/[^\u0000-\u00ff]/g, "aa").length;
};
