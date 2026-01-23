import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertRoomMember, getCurrentUser } from "./utils";

// Generate a random 6-character code
function generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export const create = mutation({
    args: {
        name: v.string(),
        type: v.union(v.literal("normal"), v.literal("temporary")),
        encryptionKeyId: v.string(), // Client generates this and tells us the ID
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log("Auth Identity:", identity);
        const userId = await getCurrentUser(ctx);
        if (!userId) throw new Error("Unauthorized");

        let code = generateRoomCode();
        // Simple collision check (could be robustified with a loop, but collisions rare for now)
        const existing = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", code))
            .first();

        if (existing) {
            code = generateRoomCode(); // Try once more
        }

        const roomId = await ctx.db.insert("rooms", {
            name: args.name,
            type: args.type,
            ownerId: userId,
            encryptionKeyId: args.encryptionKeyId,
            code,
        });

        await ctx.db.insert("members", {
            roomId,
            userId,
            role: "owner",
        });

        return { roomId, code };
    },
});

export const join = mutation({
    args: {
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) throw new Error("Unauthorized");

        const room = await ctx.db
            .query("rooms")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (!room) throw new Error("Room not found");

        const existingMember = await ctx.db
            .query("members")
            .withIndex("by_roomId_userId", (q) =>
                q.eq("roomId", room._id).eq("userId", userId)
            )
            .first();

        if (existingMember) {
            return { roomId: room._id }; // Already joined
        }

        await ctx.db.insert("members", {
            roomId: room._id,
            userId,
            role: "member",
        });

        return { roomId: room._id };
    },
});

export const getUserRooms = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) return [];

        const memberships = await ctx.db
            .query("members")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        const rooms = await Promise.all(
            memberships.map(async (m) => {
                const room = await ctx.db.get(m.roomId);
                if (!room) return null;
                return {
                    ...room,
                    role: m.role,
                };
            })
        );

        return rooms.filter((r) => r !== null);
    },
});

export const getRoom = query({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) return null;

        // Validate membership
        await assertRoomMember(ctx, args.roomId, userId);

        return await ctx.db.get(args.roomId);
    },
});
