function safeSerialize(value: unknown): string {
  try {
    if (value == null) return "[null]";
    if (typeof value === "object" && Object.keys(value).length === 0) return "[empty object]";

    const str = JSON.stringify(value);

    return str.length > 1000 ? `${str.slice(0, 1000)}…` : str;
  } catch {
    return "[unserializable]";
  }
}

export { safeSerialize };
