import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const neue = localFont({
	src: "./fonts/neue.otf",
	weight: "700",
	display: "swap",
	variable: "--font-oswald",
});

export const metadata: Metadata = {
	title: "CandyRoad",
	description: "Sell your files through frames",
	icons: {
		apple: "/apple-touch-icon.png",
		shortcut: "/favicon.ico",
		icon: "/favicon.ico",
	},
	openGraph: {
		title: "CandyRoad",
		description: "Sell your files through frames",
		url: "https://candyroad.cloud",
		siteName: "CandyRoad",
		images: ["https://www.candyroad.cloud/og.png"],
	},
	twitter: {
		card: "summary_large_image",
		title: "CandyRoad",
		description: "Sell your files through frames",
		images: ["https://www.candyroad.cloud/og.png"],
	},
	other: {
		"fc:frame": "vNext",
		"fc:frame:image": "https://www.candyroad.cloud/og.png",
		"fc:frame:button:1": "Launch App",
		"fc:frame:button:1:action": "link",
		"fc:frame:button:1:target": "https://www.candyroad.cloud",
		"fc:frame:button:2": "About",
		"fc:frame:button:2:action": "link",
		"fc:frame:button:2:target": "https://pinata.cloud/blog",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${neue.variable} antialiased`}>
				<Analytics />
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
