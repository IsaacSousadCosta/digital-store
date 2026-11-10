const { decodeImage } = require("../services/productImages");
const { positiveInteger } = require("./searchParams");

function validateEntry(entry, creating, fields) {
  return entry && typeof entry === "object" && !Array.isArray(entry) &&
    (entry.id === undefined || (!creating && positiveInteger(entry.id))) &&
    (entry.deleted === undefined || typeof entry.deleted === "boolean") &&
    Object.keys(entry).every(key => ["id", "deleted", ...fields].includes(key));
}

function validateImage(image, creating) {
  if (!validateEntry(image, creating, ["enabled", "path", "type", "content"])) return null;
  const { id, deleted, enabled, path, type, content } = image;
  if (deleted) return id && Object.keys(image).length === 2 ? { id: Number(id), deleted } : null;
  if ((enabled !== undefined && typeof enabled !== "boolean") ||
      (path !== undefined && content !== undefined)) return null;
  const source = path ?? content;
  const data = {};
  if (id !== undefined) data.id = Number(id);
  if (enabled !== undefined) data.enabled = enabled;

  if (typeof source === "string" && type === undefined && source.length <= 500 &&
      /^(?:https?:\/\/[^\s]+|\/images\/[a-z0-9/_\-.]+)$/i.test(source) &&
      !source.split("/").includes("..")) {
    return id ? { ...data, path: source } : { ...data, path: source, enabled: enabled ?? true };
  }

  if (content !== undefined) {
    const upload = decodeImage(content, type);
    if (!upload || (!id && type === undefined)) return null;
    return { ...data, upload, enabled: enabled ?? true };
  }
  return id && enabled !== undefined && source === undefined && type === undefined ? data : null;
}

function validateOption(option, creating) {
  if (!validateEntry(option, creating, ["title", "shape", "type", "radius", "values", "value"])) return null;
  const { id, deleted, title, shape, type } = option;
  const values = option.values ?? option.value;
  const radius = typeof option.radius === "string" && /^\d+px$/.test(option.radius)
    ? Number.parseInt(option.radius, 10)
    : option.radius;
  if (deleted) return id && Object.keys(option).length === 2 ? { id: Number(id), deleted } : null;
  if ((!id && (title === undefined || values === undefined)) ||
      (title !== undefined && (typeof title !== "string" || !title.trim() || title.length > 100)) ||
      (shape !== undefined && !["square", "circle"].includes(shape)) ||
      (type !== undefined && !["text", "color"].includes(type)) ||
      (radius !== undefined && (!Number.isInteger(radius) || radius < 0 || radius > 100)) ||
      (values !== undefined && (!Array.isArray(values) || !values.length || values.length > 50 ||
        values.some(value => typeof value !== "string" || !value.trim() || value.length > 255)))) return null;

  return Object.fromEntries(Object.entries({
    id: id === undefined ? undefined : Number(id),
    title: title?.trim(), shape, type, radius, values
  }).filter(([, value]) => value !== undefined));
}

module.exports = { validateImage, validateOption };
