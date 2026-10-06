/** @type {import('next').NextConfig} */
const BASE_PATH = "/wetterstation";

const nextConfig = {
    reactStrictMode: true,
    // Static export: the site is served by GitHub Pages, there is no Node process at runtime.
    output: "export",
    // Project page: the site lives at https://lennard-langenbruch.github.io/wetterstation/
    basePath: BASE_PATH,
    env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
    trailingSlash: true,
    // GitHub Pages cannot run the Next.js image optimiser.
    images: { unoptimized: true },
};

export default nextConfig;
