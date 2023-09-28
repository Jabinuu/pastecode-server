/**
 * @desc 将查表所得的数据对象中带'_'的键 转为驼峰命名
 */
exports.changeResKey = (o) => {
  return o.map((elem) => {
    for (key in elem) {
      let idx = key.indexOf("_");
      let temp;
      if (idx === -1) continue;
      while (idx !== -1) {
        temp = key.replace("_", "");
        let arr = temp.split("");
        arr[idx] = temp[idx].toUpperCase();
        temp = arr.join("");
        idx = temp.indexOf("_");
      }
      elem[temp] = elem[key];
      delete elem[key];
    }
    return elem;
  });
};
