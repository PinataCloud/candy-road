import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/pinata";
import { verifySession } from "@/utils/session";

export async function POST(request: NextRequest) {
	const authToken =
		request?.headers?.get("authorization")?.replace("Bearer ", "") || "";

	const verified = await verifySession(authToken);
	if (!verified) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const body = await request.json();
		const json = await pinata.upload
			.json({
				name: body.name,
				file: body.file,
				image: body.image,
				price: body.price,
				address: body.address,
				userId: body.userId,
			})
			.addMetadata({
				name: body.name,
			});
		await pinata.files.update({
			id: json.id,
			keyvalues: {
				userId: body.userId,
				image: body.image,
			},
		});
		return NextResponse.json(json.cid, { status: 200 });
	} catch (e) {
		console.log(e);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
