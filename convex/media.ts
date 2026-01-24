import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./utils";

// Generate a short-lived URL for the client to upload the encrypted blob
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) throw new Error("Unauthorized");

        return await ctx.storage.generateUploadUrl();
    },
});

// Save metadata after the upload is complete
export const sendImage = mutation({
    args: {
        roomId: v.id("rooms"),
        storageId: v.id("_storage"),
        mimeType: v.string(),
        encryption: v.object({
            iv: v.string(),
            keyVersion: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Verify user is a member of the room
        const member = await ctx.db
            .query("members")
            .withIndex("by_roomId_userId", (q) =>
                q.eq("roomId", args.roomId).eq("userId", userId)
            )
            .first();

        if (!member) throw new Error("You are not a member of this room");

        await ctx.db.insert("media", {
            roomId: args.roomId,
            storageId: args.storageId,
            type: "image", // For now, we only support images in Phase 3
            mimeType: args.mimeType,
            userId: userId,
            encryption: args.encryption,
        });
    },
});

export const list = query({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Verify member
        const member = await ctx.db
            .query("members")
            .withIndex("by_roomId_userId", (q) =>
                q.eq("roomId", args.roomId).eq("userId", userId)
            )
            .first();
        if (!member) throw new Error("Unauthorized");

        const media = await ctx.db
            .query("media")
            .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
            .collect();

        // Map to include signed URLs
        return Promise.all(
            media.map(async (m) => ({
                ...m,
                url: await ctx.storage.getUrl(m.storageId),
            }))
        );
    },
});
