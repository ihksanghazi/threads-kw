"use server";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

interface Params {
	text: string;
	author: string;
	communityId: string | null;
	path: string;
}

export async function createThread({
	text,
	author,
	communityId,
	path,
}: Params) {
	connectToDB();

	try {
		const createdThread = await Thread.create({
			text,
			author,
			community: null,
		});

		// update usermodel
		await User.findByIdAndUpdate(author, {
			$push: { threads: createdThread._id },
		});

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error Creating thread : ${error.message}`);
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	connectToDB();

	// calculate the number of posts to skip
	const skipAmount = (pageNumber - 1) * pageSize;

	// fetch posts that have no parents (top-level threads)
	const postQuery = Thread.find({
		parentId: { $in: [null, undefined] },
	})
		.sort({ createdAt: "desc" })
		.skip(skipAmount)
		.limit(pageSize)
		.populate({ path: "author", model: User })
		.populate({
			path: "children",
			populate: {
				path: "author",
				model: User,
				select: "_id name parentId image",
			},
		});

	const totalPostsCount = await Thread.countDocuments({
		parentId: { $in: [null, undefined] },
	});

	const posts = await postQuery.exec();

	const isNext = totalPostsCount > skipAmount + posts.length;

	return { posts, isNext };
}

export async function fetchThreadById(id: string) {
	connectToDB();

	try {
		// TODO Populate Community
		const thread = await Thread.findById(id)
			.populate({
				path: "author",
				model: User,
				select: "_id id name image",
			})
			.populate({
				path: "children",
				populate: [
					{
						path: "author",
						model: User,
						select: "_id id name parentId image",
					},
					{
						path: "children",
						model: Thread,
						populate: {
							path: "author",
							model: User,
							select: "_id id name parentId image",
						},
					},
				],
			})
			.exec();

		return thread;
	} catch (error: any) {
		throw new Error(`Error Fetching thread : ${error.message}`);
	}
}

export async function addCommentToThread(
	threadId: string,
	commentText: string,
	userId: string,
	path: string
) {
	connectToDB();

	try {
		// find the original thread by id
		const originalThread = await Thread.findById(threadId);
		if (!originalThread) {
			throw new Error("Thread not found");
		}

		// create a new thread with the comment text
		const commentThread = new Thread({
			text: commentText,
			author: userId,
			parentId: threadId,
		});

		// save the new thread
		const saveCommentThread = await commentThread.save();

		// update the original thread to include the new comment
		originalThread.children.push(saveCommentThread._id);

		// save the original thread
		await originalThread.save();
		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error Adding Comment : ${error.message}`);
	}
}
