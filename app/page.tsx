import { Footer } from "@/components/footer";
import { FrameGrid } from "@/components/frame-grid";
import { LoginButton } from "@/components/login-button";
import { Nav } from "@/components/nav";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center gap-4 justify-between my-12 sm:mx-auto mx-2">
			<div className="flex flex-col items-center gap-4 justify-start sm:mx-auto mx-2 mb-8 w-full">
				<Nav />
				<LoginButton />
				<FrameGrid />
			</div>
			<Footer />
		</div>
	);
}
