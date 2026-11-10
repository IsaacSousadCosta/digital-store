function positiveInteger(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const number = Number(value);
  return /^\d+$/.test(String(value)) && Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function searchParams(query, allowedFields) {
  const limit = query.limit === "-1" ? -1 : positiveInteger(query.limit ?? "12");
  const page = limit === -1 ? 1 : positiveInteger(query.page ?? "1");
  const fields = typeof query.fields === "string" ? query.fields.split(",") : null;

  if (!limit || !page || (limit > 0 && !Number.isSafeInteger(limit * page)) ||
      (query.fields !== undefined && (!fields || fields.some(field => !allowedFields.includes(field))))) {
    return null;
  }

  return { limit, page, fields };
}

function pagination({ limit, page }) {
  return limit === -1 ? {} : { limit, offset: (page - 1) * limit };
}

module.exports = { positiveInteger, searchParams, pagination };
