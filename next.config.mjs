const pageRewrites = [
    {
        source: "/articles",
        destination: "/articles/page/1"
    },
    {
        source: "/songs",
        destination: "/songs/page/1"
    },
    {
        source: "/lists",
        destination: "/lists/page/1"
    },
    {
        source: "/albums",
        destination: "/albums/page/1"
    },
    {
        source: "/lists/:id",
        destination: "/lists/:id/page/1"
    },
    {
        source: "/albums/:id",
        destination: "/albums/:id/page/1"
    },
    {
        source: "/tags/:id",
        destination: "/tags/:id/page/1"
    }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "images.ctfassets.net",
            },
            {
                hostname: "cdn.sanity.io"
            }
        ]
    },
    async redirects() {
        return pageRewrites.map(({ source, destination }) => ({
            source: destination,
            destination: source,
            permanent: true,
        }));
    },
    async rewrites() {
        return pageRewrites;
    }
};

export default nextConfig;
