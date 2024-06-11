/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true, // This indicates that the redirect is permanent (301 status code)
      },
    ];
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       destination: "/dashboard",
  //       headers: [{ key: "referrer-policy", value: "no-referrer" }],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
