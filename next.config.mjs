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
    }
};

export default nextConfig;
