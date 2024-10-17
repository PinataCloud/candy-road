/** @jsxImportSource frog/jsx */
import { Button, Frog, parseEther } from "frog";
import { handle } from "frog/next";
import { pinata } from "@/utils/pinata";
import { createClient } from "@/utils/supabase/server";
import { validateFrameMessage } from "@/utils/verifyFrame";

const app = new Frog({
	basePath: "/api/frame",
	title: "CandyRoad",
});

type FrameCID = {
	name: string;
	file: string;
	image: string;
	price: string;
	address: string;
	userId: string;
};

app.frame("/:cid", async (c) => {
	const cid = c.req.param("cid");
	const { data } = await pinata.gateways.get(cid);
	const frameInfo = data as unknown as FrameCID;
	return c.res({
		title: frameInfo.name,
		action: `/complete/${cid}`,
		image: frameInfo?.image,
		headers: {
			"cache-control": "max-age=0",
		},
		intents: [
			<Button.Transaction key="1" target={`/purchase/${cid}`}>
				{frameInfo.price} Ξ
			</Button.Transaction>,
			<Button key="2" action={`/redeem/${cid}`}>
				Redeem
			</Button>,
		],
	});
});

app.transaction("/purchase/:cid", async (c) => {
	const cid = c.req.param("cid");
	const { data } = await pinata.gateways.get(cid);
	const frameInfo = data as unknown as FrameCID;

	return c.send({
		chainId: "eip155:84532",
		to: frameInfo.address as `0x`,
		value: parseEther(frameInfo?.price),
	});
});

app.frame("/complete/:cid", async (c) => {
	const cid = c.req.param("cid");
	const supabase = createClient();
	const { transactionId } = c;

	if (!transactionId) {
		return c.res({
			action: `/complete/${cid}`,
			image: (
				<div style={{ color: "white", display: "flex", fontSize: 60 }}>
					Transaction incomplete
				</div>
			),
			intents: [
				<Button.Transaction key="1" target={`/purchase/${cid}`}>
					Buy
				</Button.Transaction>,
			],
		});
	}

	const { data: insertRes, error } = await supabase
		.from("purchases")
		.insert([
			{
				buyer_id: c.frameData?.fid,
				cid: c.req.param("cid"),
			},
		])
		.select();
	console.log(insertRes);

	if (error) {
		return c.res({
			action: `/complete/${c.req.param("cid")}`,
			image: (
				<div style={{ color: "white", display: "flex", fontSize: 60 }}>
					Error adding record
				</div>
			),
			intents: [
				<Button.Transaction key="1" target={`/purchase/${cid}`}>
					Buy
				</Button.Transaction>,
			],
		});
	}

	const dcReq = await fetch(
		"https://api.warpcast.com/v2/ext-send-direct-cast",
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${process.env.WARPCAST_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				recipientFid: c.frameData?.fid,
				message: `Thank you for using CandyRoad! Your content can be downloaded any time with the frame attached to this message. https://www.candyroad.cloud/api/frame/${cid}`,
				idempotencyKey: crypto.randomUUID().toString(),
			}),
		},
	);

	if (!dcReq.ok) {
		const dcRes = await dcReq.json();
		console.log(dcRes);
	}

	return c.res({
		action: `/redeem/${cid}`,
		image: (
			<div style={{ color: "white", display: "flex", fontSize: 60 }}>
				Transaction Complete!
			</div>
		),
		intents: [
			<Button key="1" action={`/redeem/${cid}`}>
				Redeem File
			</Button>,
		],
	});
});

app.frame("/redeem/:cid", async (c) => {
	const body = await c.req.json();
	const verification = await validateFrameMessage(body);
	const cid = c.req.param("cid");
	const supabase = createClient();
	const { data } = await pinata.gateways.get(cid);
	const frameInfo = data as unknown as FrameCID;
	const fileUrl = await pinata.gateways.createSignedURL({
		cid: frameInfo.file,
		expires: 45,
	});

	const { data: rows, error } = await supabase
		.from("purchases")
		.select("*")
		.eq("buyer_id", c.frameData?.fid)
		.eq("cid", cid);
	console.log(rows);

	if (error || rows.length === 0 || !verification.isValid) {
		return c.res({
			action: `/complete/${cid}`,
			image: (
				<div style={{ color: "white", display: "flex", fontSize: 60 }}>
					Unauthorized
				</div>
			),
			intents: [
				<Button.Transaction key="1" target={`/purchase/${cid}`}>
					{frameInfo.price} Ξ
				</Button.Transaction>,
			],
		});
	}

	return c.res({
		image: (
			<div style={{ color: "white", display: "flex", fontSize: 60 }}>
				Authorized! Download file
			</div>
		),
		intents: [
			<Button.Link key="1" href={fileUrl}>
				Download File
			</Button.Link>,
		],
	});
});

export const GET = handle(app);
export const POST = handle(app);
