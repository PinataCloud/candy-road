"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import Image from "next/image";

export function LoginButton() {
	const { ready, authenticated, login } = usePrivy();
	// Disable login when Privy is not ready or the user is already authenticated
	const disableLogin = !ready || (ready && authenticated);

	return (
		<>
			{!authenticated && (
				<div className="flex flex-col items-center gap-16 mt-24">
					<h1 className="sm:text-7xl text-4xl text-center text-[#6d57ff] font-oswald">
						Sell Your Files <br /> in Frame
					</h1>

					<Card className="max-w-[400px] overflow-hidden">
						<Image src="/candy.png" height={800} width={800} alt="image" />
						<div className="flex items-center p-2 gap-2 w-full bg-muted">
							<Button className="flex-1 bg-muted-foreground">0.005 Ξ</Button>
							<Button className="flex-1 bg-muted-foreground">Redeem</Button>
						</div>
					</Card>

					<Button
						className="mt-12 text-xl font-bold w-48 p-6"
						disabled={disableLogin}
						onClick={login}
					>
						{disableLogin ? "loading" : "Get Started"}
					</Button>
				</div>
			)}
		</>
	);
}
