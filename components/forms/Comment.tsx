"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.action";
import { useState } from "react";
// import { createThread } from "@/lib/actions/thread.action";

interface Props {
	threadId: string;
	currentUserImg: string;
	currentUserId: string;
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const pathname = usePathname();

	const form = useForm({
		resolver: zodResolver(CommentValidation),
		defaultValues: {
			thread: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
		setIsLoading(true);

		await addCommentToThread(
			threadId,
			values.thread,
			JSON.parse(currentUserId),
			pathname
		);

		form.reset();

		setIsLoading(false);
	};
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
				<FormField
					control={form.control}
					name="thread"
					render={({ field }) => (
						<FormItem className="flex gap-3 items-center w-full">
							<FormLabel>
								<Image
									src={currentUserImg}
									alt="Profile Image"
									width={48}
									height={48}
									className="rounded-full object-cover"
								/>
							</FormLabel>
							<FormControl className="border-none bg-transparent">
								<Input
									type="text"
									placeholder="Comment..."
									className="no-focus text-light-1 outline-none"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<Button disabled={isLoading} type="submit" className="comment-form_btn">
					Reply
				</Button>
			</form>
		</Form>
	);
};

export default Comment;
