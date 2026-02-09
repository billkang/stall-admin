export function flatten(data: any[]) {
  const result: any[] = [];
  data.forEach((d) => {
    if (Array.isArray(d)) {
      result.push(...flatten(d));
    } else {
      result.push(d);
      if (d.children?.length) {
        result.push(...flatten(d.children));
      }
    }
  });
  return result;
}
