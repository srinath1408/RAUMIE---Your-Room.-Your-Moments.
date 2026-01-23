import { query } from "./_generated/server";
import { getCurrentUser } from "./utils";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getCurrentUser(ctx);
        if (!userId) return [];

        // 1. Get all rooms I am in
        const myMemberships = await ctx.db
            .query("members")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        if (myMemberships.length === 0) return [];

        // 2. For each room, get other members
        const friendIds = new Set<string>();

        // Note: This could be optimized, but fine for MVP
        for (const membership of myMemberships) {
            const roomMembers = await ctx.db
                .query("members")
                .withIndex("by_roomId", (q) => q.eq("roomId", membership.roomId))
                .collect();

            for (const m of roomMembers) {
                if (m.userId !== userId) {
                    friendIds.add(m.userId);
                }
            }
        }

        // 3. Retrieve user details (mocked for now as we don't sync all Clerk fields to Convex users table yet fully)
        // In a real app, we'd query the `users` table or call Clerk. 
        // For this MVP, we will return the userIds. The frontend can use Clerk to fetch details if needed, 
        // or we assume the `users` table is synced via webhook. (Which we haven't built yet).
        // Let's return a basic structure.

        return Array.from(friendIds).map(id => ({ userId: id }));
    },
});
