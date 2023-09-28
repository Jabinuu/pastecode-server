const { v4: uuidv4 } = require("uuid");
// uuid 由共计32位的16进制数字组成，并用-分割为5部分：8-4-4-4-12,比如314a63fb-6209-fac4-e8df-9527f2ea9cd8
const uuid = () => uuidv4().replace(/-/g, "");

module.exports = uuid;
