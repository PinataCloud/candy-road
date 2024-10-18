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
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";

export function CreateFrame({ getFrames }: any) {
	const [image, setImage] = useState<File>();
	const [file, setFile] = useState<File>();
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const { getAccessToken, user } = usePrivy();
	const { toast } = useToast();
	const userAddress = user?.wallet?.address;

	const formSchema = z.object({
		price: z.string(),
		address: z.string().min(42, {
			message: "Address cannot be empty",
		}),
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
		setLoading(true);
		const token = await getAccessToken();
		if (!file || !image) {
			toast({
				title: "Select a File",
				description: "Cover image an file to sell cannot be empty",
				variant: "destructive",
			});
			setLoading(false);
			return;
		}

		if (!user?.id) {
			toast({
				title: "Issue with login",
				description: "Please try logging out and logging back in",
				variant: "destructive",
			});
			setLoading(false);
			return;
		}

		try {
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
				.group("0192868e-6144-7685-9fc5-af68a1e48f29");

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
			setLoading(false);
			setOpen(false);
			toast({
				title: "Frame created!",
				description: "Copy the link and share on Farcaster!",
			});
			form.reset();
			await getFrames();
		} catch (error) {
			toast({
				title: "Problem creating frame",
				description: `${error}`,
				variant: "destructive",
			});
			console.log(error);
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="font-bold text-xl">Create Frame</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md max-w-sm overflow-y-scroll sm:py-6 py-12 max-h-screen">
				<DialogHeader>
					<DialogTitle>Create a Frame</DialogTitle>
					<DialogDescription>
						Build your by choosing a cover image, the file you want to sell, and
						a price. Once complete you can copy the frame link or share it to
						Warpcast!
					</DialogDescription>
				</DialogHeader>
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
							<Input type="file" onChange={imageHandle} />
							<FormDescription>
								Image preview that will show in the frame
							</FormDescription>
						</FormItem>
						<FormItem>
							<FormLabel>File</FormLabel>
							<Input type="file" onChange={fileHandle} />
							<FormDescription>File you want to sell</FormDescription>
						</FormItem>
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price</FormLabel>
									<FormControl>
										<Input type="number" placeholder="0.005" {...field} />
									</FormControl>
									<FormDescription>
										Price of the file in Eth on 🔵 Base
									</FormDescription>
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
						{loading ? (
							<Button className="w-full font-bold text-xl" disabled>
								<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								Creating Frame...
							</Button>
						) : (
							<Button className="font-bold text-xl w-full" type="submit">
								Submit
							</Button>
						)}
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
