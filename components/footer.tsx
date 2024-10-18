import Image from "next/image";
import Link from "next/link";

export function Footer() {
	return (
		<Link
			className="flex flex-col items-center justify-center"
			href="https://pinata.cloud"
			target="_blank"
		>
			<p>Powered by</p>
			<Image
				src="/pinata.png"
				width={600}
				height={600}
				alt="pinata logo"
				className="w-36 -mt-4"
			/>
		</Link>
	);
}
