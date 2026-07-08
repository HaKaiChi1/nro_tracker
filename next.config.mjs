/** @type {import('next').NextConfig} */
const nextConfig = {
  // Xuất site tĩnh cho GitHub Pages. Khi deploy dưới https://<user>.github.io/<repo>/
  // workflow sẽ set NEXT_PUBLIC_BASE_PATH=/<repo>; dev local thì rỗng.
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
