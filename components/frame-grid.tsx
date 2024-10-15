"use client";

import { usePrivy } from "@privy-io/react-auth";
import { CreateFrame } from "./create-frame";

export function FrameGrid() {
	const { authenticated } = usePrivy();

	if (!authenticated) {
		return null;
	}

	return (
		<div>
			<h1>Frame Grid</h1>
			<CreateFrame />
		</div>
	);
}
