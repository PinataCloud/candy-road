import { LoginButton } from "@/components/login-button";
import Image from "next/image";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<h1>Candy Road</h1>
			<LoginButton />
		</div>
	);
}
