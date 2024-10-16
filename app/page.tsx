import { LoginButton } from "@/components/login-button";
import { FrameGrid } from "@/components/frame-grid";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center gap-4 justify-start mt-12">
			<h1>Candy Road</h1>
			<LoginButton />
			<FrameGrid />
		</div>
	);
}
