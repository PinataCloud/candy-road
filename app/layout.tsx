import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/providers";
import { Lobster } from "next/font/google";

const lobster = Lobster({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
	variable: "--font-lobster",
});

export const metadata: Metadata = {
	title: "CandyRoad",
	description: "Sell your files through frames",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${lobster.variable} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
