import { LoginButton } from "@/components/login-button-nav";
import Image from "next/image";

export function Nav() {
	return (
		<div className="flex w-full items-center justify-between max-w-screen-lg">
			<Image
				src="/title.svg"
				width={800}
				height={800}
				className="sm:w-64 w-48 px-2 sm:px-0"
				alt="title"
			/>
			<LoginButton />
		</div>
	);
}
