/** @jsxImportSource frog/jsx */
import { Button, Frog, parseEther } from "frog";
import { handle } from "frog/next";
import { pinata } from "@/utils/pinata";
import { createClient } from "@/utils/supabase/server";

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
	const { data } = await pinata.gateways.get(c.req.param("cid"));
	const frameInfo = data as unknown as FrameCID;
	return c.res({
		action: `/complete/${c.req.param("cid")}`,
		image: frameInfo?.image,
		intents: [
			<Button.Transaction key="1" target={`/purchase/${c.req.param("cid")}`}>
				Buy
			</Button.Transaction>,
			<Button key="2" action={`/redeem/${c.req.param("cid")}`}>
				Redeem
			</Button>,
		],
	});
});

app.transaction("/purchase/:cid", async (c) => {
	const { data } = await pinata.gateways.get(c.req.param("cid"));
	const frameInfo = data as unknown as FrameCID;

	return c.send({
		chainId: "eip155:84532",
		to: frameInfo.address as `0x`,
		value: parseEther(frameInfo?.price),
	});
});

app.frame("/complete/:cid", async (c) => {
	const supabase = createClient();
	const { transactionId } = c;

	if (!transactionId) {
		return c.res({
			image: (
				<div style={{ color: "white", display: "flex", fontSize: 60 }}>
					Transaction incomplete
				</div>
			),
			intents: [
				<Button.Transaction key="1" target={`/purchase/${c.req.param("cid")}`}>
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
			action: "/",
			image: (
				<div style={{ color: "white", display: "flex", fontSize: 60 }}>
					Error adding record
				</div>
			),
			intents: [
				<Button.Transaction key="1" target={`/purchase/${c.req.param("cid")}`}>
					Buy
				</Button.Transaction>,
			],
		});
	}

	return c.res({
		action: `/redeem/${c.req.param("cid")}`,
		image: (
			<div style={{ color: "white", display: "flex", fontSize: 60 }}>
				Transaction Complete!
			</div>
		),
		intents: [
			<Button key="1" action={`/redeem/${c.req.param("cid")}`}>
				Redeem File
			</Button>,
		],
	});
});

app.frame("/redeem/:cid", async (c) => {
	const supabase = createClient();
	const { data } = await pinata.gateways.get(c.req.param("cid"));
	const frameInfo = data as unknown as FrameCID;
	const fileUrl = await pinata.gateways.createSignedURL({
		cid: frameInfo.file,
		expires: 5000,
	});

	const { data: rows, error } = await supabase
		.from("purchases")
		.select("*")
		.eq("buyer_id", c.frameData?.fid)
		.eq("cid", c.req.param("cid"));
	console.log(rows);

	if (error || rows.length === 0) {
		return c.res({
			action: "/",
			image: (
				<div style={{ color: "white", display: "flex", fontSize: 60 }}>
					Unauthorized
				</div>
			),
			intents: [
				<Button.Transaction key="1" target={`/purchase/${c.req.param("cid")}`}>
					Buy
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
