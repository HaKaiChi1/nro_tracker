// basePath của site khi deploy dưới https://<user>.github.io/<repo>/.
// next/link và next/router tự thêm prefix này, nhưng fetch() và <a href> thì không,
// nên mọi đường dẫn tới file tĩnh trong public/ phải đi qua withBase().
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  return `${BASE_PATH}${path}`;
}
