/** @type {import('next').NextConfig} */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://cdn.candyroad.cloud/ https://www.candyroad.cloud https://candyroad.cloud;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
    frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
    connect-src https://uploads.pinata.cloud/v3/files http://localhost:3000/ https://candyroad.cloud https://www.candyroad.cloud https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems;

`;
const nextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Content-Security-Policy",
						value: cspHeader.replace(/\n/g, ""),
					},
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*",
				port: "",
				pathname: "**/**",
			},
		],
	},
};

export default nextConfig;
