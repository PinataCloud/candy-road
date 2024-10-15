/** @jsxImportSource frog/jsx */
import { Button, Frog, parseEther } from "frog";
import { handle } from "frog/next";
import { pinata } from "@/utils/pinata";

const app = new Frog({
	basePath: "/api/frame",
	title: "Frog Frame",
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
		action: "/complete/:cid",
		image: frameInfo?.image,
		intents: [
			<Button.Transaction key="1" target={`/purchase/${c.req.param("cid")}`}>
				Buy
			</Button.Transaction>,
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
	const { transactionId } = c;
	const { data } = await pinata.gateways.get(c.req.param("cid"));
	const frameInfo = data as unknown as FrameCID;
	const fileUrl = await pinata.gateways.createSignedURL({
		cid: frameInfo.file,
		expires: 5000,
	});

	if (!transactionId) {
		return c.res({
			action: "/",
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

	return c.res({
		image: (
			<div style={{ color: "white", display: "flex", fontSize: 60 }}>
				Transaction Complete!
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
