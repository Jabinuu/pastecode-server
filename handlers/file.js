const path = require("path");
const fs = require("fs");

const { downloadCodeFail } = require("../constant/err.type");

exports.downloadCodeFile = async (ctx) => {
  try {
    const filename = ctx.path.split("/")[3];
    const filePath = path.join(__dirname, "../files", `${filename}.cpp`);

    const stats = fs.statSync(filePath);
    const fileSize = stats.size; // file size
    ctx.set("Content-Length", fileSize.toString()); // set

    ctx.set("Content-Disposition", `attachment; filename=${filename}.cpp`); // disposition: attachment -> file download not preview
    ctx.set("Content-Type", "application/octet-stream");
    const stream = fs.createReadStream(filePath);
    return stream;
  } catch (e) {
    console.error(e);
    return ctx.app.emit("error", downloadCodeFail, ctx);
  }
};
