import { type NextRequest, NextResponse } from "next/server";
import { pinata } from "@/utils/pinata";
import { verifySession } from "@/utils/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	const authToken =
		req?.headers?.get("authorization")?.replace("Bearer ", "") || "";

	const verified = await verifySession(authToken);
	if (!verified) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const uuid = crypto.randomUUID();
		const keyData = await pinata.keys.create({
			keyName: uuid.toString(),
			permissions: {
				endpoints: {
					pinning: {
						pinFileToIPFS: true,
					},
				},
			},
			maxUses: 2,
		});
		return NextResponse.json(keyData, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ text: "Error creating API Key:" },
			{ status: 500 },
		);
	}
}
