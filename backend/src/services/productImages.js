const { randomUUID } = require("node:crypto");
const extensions = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp"
};
const maxBytes = 2 * 1024 * 1024;

function decodeImage(content, type) {
  if (typeof content !== "string" || content.length > Math.ceil(maxBytes / 3) * 4 ||
      (type !== undefined && typeof type !== "string") ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) return null;

  const buffer = Buffer.from(content, "base64");
  if (buffer.length > maxBytes || buffer.toString("base64") !== content) return null;

  const format = buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) ? "png" :
    buffer.subarray(0, 3).equals(Buffer.from("ffd8ff", "hex")) ? "jpg" :
    buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;

  return format && (type === undefined || extensions[type] === format)
    ? { buffer, format }
    : null;
}

function uploadFields({ buffer, format }) {
  return {
    path: "/images/uploads/" + randomUUID() + "." + format,
    mime_type: format === "jpg" ? "image/jpeg" : "image/" + format,
    file_content: buffer
  };
}

module.exports = { decodeImage, uploadFields };
