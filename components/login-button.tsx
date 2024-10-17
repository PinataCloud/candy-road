"use client";

import { UserPill } from "@privy-io/react-auth/ui";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "./ui/button";

export function LoginButton() {
	const { ready, authenticated, login } = usePrivy();
	// Disable login when Privy is not ready or the user is already authenticated
	const disableLogin = !ready || (ready && authenticated);

	return (
		<>
			{!authenticated ? (
				<Button disabled={disableLogin} onClick={login}>
					Log in
				</Button>
			) : (
				<UserPill />
			)}
		</>
	);
}
