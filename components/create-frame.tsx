"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { pinata } from "@/utils/pinata";

export function CreateFrame() {
	const [image, setImage] = useState<File>();
	const [file, setFile] = useState<File>();
	const { getAccessToken, user } = usePrivy();
	const userAddress = user?.wallet?.address;

	const formSchema = z.object({
		price: z.string(),
		address: z.string(),
		name: z.string(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			address: userAddress ? userAddress : "",
		},
	});

	const imageHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
		setImage(e.target?.files?.[0]);
	};

	const fileHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFile(e.target?.files?.[0]);
	};

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const token = await getAccessToken();
		if (!file || !image) {
			alert("Select a file");
			return;
		}

		if (!user?.id) {
			alert("Issue with login");
			return;
		}

		const keyRequest = await fetch("/api/key", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const keyData = await keyRequest.json();
		const { cid: fileCid } = await pinata.upload.file(file).key(keyData.JWT);
		const { cid: imageCid } = await pinata.upload
			.file(image)
			.key(keyData.JWT)
			.group(process.env.NEXT_PUBLIC_GROUP_ID!);

		const data = JSON.stringify({
			name: values.name,
			image: `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/files/${imageCid}`,
			file: fileCid,
			address: values.address,
			price: values.price,
			userId: user?.id,
		});

		const createFrameRequest = await fetch("/api/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: data,
		});
		const createdFrame = await createFrameRequest.json();
		console.log(createdFrame);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Create Frame</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="My Frame" {...field} />
									</FormControl>
									<FormDescription>Name of your frame</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormItem>
							<FormLabel>Cover Image</FormLabel>
							<Input type="file" onChange={fileHandle} />
							<FormDescription>
								Image preview that will show in the frame
							</FormDescription>
						</FormItem>
						<FormItem>
							<FormLabel>File</FormLabel>
							<Input type="file" onChange={imageHandle} />
							<FormDescription>File you want to sell</FormDescription>
						</FormItem>
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price</FormLabel>
									<FormControl>
										<Input placeholder="0.005" {...field} />
									</FormControl>
									<FormDescription>Price of the file in Eth</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input
											className="font-mono"
											placeholder="0x..."
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Address of the wallet you want to be paid at
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
