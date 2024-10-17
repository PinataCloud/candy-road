import { LoginButton } from "@/components/login-button";
import { FrameGrid } from "@/components/frame-grid";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center gap-4 justify-start mt-12">
			<h1 className="font-lobster text-7xl p-4 bg-cover bg-clip-text bg-gradient-to-r from-[#8A79FF] to-[#F093FF] text-transparent">
				Candy Road
			</h1>
			<LoginButton />
			<FrameGrid />
		</div>
	);
}
