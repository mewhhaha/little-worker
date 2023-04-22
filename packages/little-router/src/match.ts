export const match = (
  segments: string[],
  pattern: string[]
): null | Record<string, string> => {
  if (pattern.length === 1 && pattern[0] === "*") {
    return { "*": segments.join("/") };
  }

  if (!pattern.includes("*") && segments.length !== pattern.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const p = pattern[i];
    if (p === "*") {
      params["*"] = segments.slice(i).join("/");
      return params;
    } else if (p[0] === ":") {
      params[p.slice(1)] = s;
    } else if (s !== p) {
      return null;
    }
  }

  return params;
};
