"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { CreateFrame } from "./create-frame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { FileListItem } from "pinata";
import { ClipboardCopyIcon, CheckIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Image from "next/image";

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
		<div className="flex flex-col gap-12 mt-12">
			<CreateFrame getFrames={getFrames} />
			<div className="flex flex-col gap-4">
				{frames.length === 0 && (
					<p className="font-bold text-lg">Make your first frame!</p>
				)}
				{frames &&
					frames.length > 0 &&
					frames.map((frame: FileListItem) => (
						<Card className="max-w-[400px] overflow-hidden" key={frame.id}>
							<div className="flex justify-between items-center px-2">
								<p className="text-2xl font-bold p-2">{frame.name}</p>
								<div className="flex items-center gap-2">
									<Button className="bg-[#472A91]" size="icon" asChild>
										<Link
											className="h-4 w-4"
											href={`https://warpcast.com/~/compose?embeds[]=https://www.candyroad.cloud/api/frame/${frame.cid}`}
											target="_blank"
										>
											<svg
												width="32"
												height="32"
												viewBox="0 0 1260 1260"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<title>Warpcast Logo</title>
												<g clip-path="url(#clip0_1_2)">
													<path
														d="M947.747 1259.61H311.861C139.901 1259.61 0 1119.72 0 947.752V311.871C0 139.907 139.901 0.00541362 311.861 0.00541362H947.747C1119.71 0.00541362 1259.61 139.907 1259.61 311.871V947.752C1259.61 1119.72 1119.71 1259.61 947.747 1259.61Z"
														fill="#472A91"
													/>
													<path
														d="M826.513 398.633L764.404 631.889L702.093 398.633H558.697L495.789 633.607L433.087 398.633H269.764L421.528 914.36H562.431L629.807 674.876L697.181 914.36H838.388L989.819 398.633H826.513Z"
														fill="white"
													/>
												</g>
												<defs>
													<clipPath id="clip0_1_2">
														<rect
															width="1259.61"
															height="1259.61"
															fill="white"
														/>
													</clipPath>
												</defs>
											</svg>
										</Link>
									</Button>
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
											<CheckIcon className="h-4 w-4 text-pu" />
										) : (
											<ClipboardCopyIcon className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>
							<Image
								width={512}
								height={512}
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
