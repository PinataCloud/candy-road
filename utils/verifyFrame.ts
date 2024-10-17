export function hexStringToUint8Array(hexstring: string): Uint8Array {
	return new Uint8Array(
		hexstring.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)),
	);
}

export async function validateFrameMessage(body: any): Promise<{
	isValid: boolean;
	message: any | undefined;
}> {
	const hubBaseUrl = "https://hub.pinata.cloud";
	const data = body.trustedData.messageBytes;
	const validateMessageResponse = await fetch(
		`${hubBaseUrl}/v1/validateMessage`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/octet-stream",
			},
			body: hexStringToUint8Array(data),
		},
	);
	const result = await validateMessageResponse.json();

	if (result && result.valid) {
		return {
			isValid: result.valid,
			message: result.message,
		};
	} else {
		return {
			isValid: false,
			message: undefined,
		};
	}
}
