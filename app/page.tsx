import { FrameGrid } from "@/components/frame-grid";
import { LoginButton } from "@/components/login-button";
import { Nav } from "@/components/nav";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center gap-4 justify-start my-12 sm:mx-auto mx-2">
			<Nav />
			<LoginButton />
			<FrameGrid />
		</div>
	);
}
