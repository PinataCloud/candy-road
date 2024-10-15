"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { CreateFrame } from "./create-frame";
import { Card } from "./ui/card";
import type { FileListItem } from "pinata";

export function FrameGrid() {
	const [frames, setFrames] = useState([]);
	const { authenticated, user, getAccessToken } = usePrivy();

	async function getFrames() {
		try {
			const token = await getAccessToken();
			const fileReq = await fetch(`/api/files?userId=${user?.id}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const files = await fileReq.json();
			console.log(files);
			setFrames(files.files);
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if (!authenticated || !user) {
			return;
		}

		async function getFrames() {
			try {
				const token = await getAccessToken();
				const fileReq = await fetch(`/api/files?userId=${user?.id}`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const files = await fileReq.json();
				console.log(files);
				setFrames(files.files);
			} catch (error) {
				console.log(error);
			}
		}

		getFrames();
	}, [authenticated, user, getAccessToken]);

	if (!authenticated && !user) {
		return null;
	}

	return (
		<div className="flex flex-col gap-12">
			<CreateFrame getFrames={getFrames} />
			<div className="flex flex-col gap-4">
				{frames &&
					frames.length > 0 &&
					frames.map((frame: FileListItem) => (
						<Card className="max-w-[400px] overflow-hidden" key={frame.id}>
							<p className="text-2xl font-bold p-2">{frame.name}</p>
							<img
								className="aspect-video object-cover"
								src={frame.keyvalues.image}
								alt={frame.name as string}
							/>
						</Card>
					))}
			</div>
		</div>
	);
}
