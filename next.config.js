/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.resolve.fallback = Object.assign(config.resolve.fallback || {}, {
            typeorm: false
        });
        if (!options.dev) {
            config.devtool = false;
        }
        config.optimization.splitChunks = {
            chunks: "all"
        };
        return config;
    },

};

module.exports = nextConfig;
