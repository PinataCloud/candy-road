import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/pinata";
import { verifySession } from "@/utils/session";

export async function GET(request: NextRequest) {
	const authToken =
		request?.headers?.get("authorization")?.replace("Bearer ", "") || "";

	const verified = await verifySession(authToken);

	if (!verified) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const searchParams = request.nextUrl.searchParams;
	const userId = searchParams.get("userId");
	if (!userId) {
		return NextResponse.json(
			{ text: "Must provide userId query" },
			{ status: 400 },
		);
	}
	try {
		const files = await pinata.files.list().metadata({
			userId: userId,
		});
		return NextResponse.json(files);
	} catch (error) {
		console.log(error);
		return NextResponse.json({ text: "Error fetching files" }, { status: 500 });
	}
}
