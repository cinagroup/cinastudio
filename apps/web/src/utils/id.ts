export function createId(prefix = "id") {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return prefix ? `${prefix}-${randomPart}` : randomPart;
}
