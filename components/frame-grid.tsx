"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { CreateFrame } from "./create-frame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { FileListItem } from "pinata";
import { ClipboardCopyIcon, CheckIcon } from "@radix-ui/react-icons";

export function FrameGrid() {
	const [frames, setFrames] = useState([]);
	const { authenticated, user, getAccessToken } = usePrivy();
	const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

	const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

	async function handleCopy(frameId: string) {
		setCopiedStates((prev) => ({ ...prev, [frameId]: true }));
		await wait();
		setCopiedStates((prev) => ({ ...prev, [frameId]: false }));
	}

	async function copyToClipboard(content: string, frameId: string) {
		navigator.clipboard
			.writeText(content)
			.then(async () => await handleCopy(frameId))
			.catch(() => alert("Failed to copy"));
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
							<div className="flex justify-between items-center">
								<p className="text-2xl font-bold p-2">{frame.name}</p>
								<Button
									variant="outline"
									type="submit"
									size="icon"
									onClick={() =>
										copyToClipboard(
											`https://www.candyroad.cloud/api/frame/${frame.cid}`,
											frame.id,
										)
									}
								>
									{copiedStates[frame.id] ? (
										<CheckIcon className="h-4 w-4" />
									) : (
										<ClipboardCopyIcon className="h-4 w-4" />
									)}
								</Button>
							</div>
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
