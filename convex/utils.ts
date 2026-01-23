import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Throws if the specific user is not a member of the room.
 */
export async function assertRoomMember(
    ctx: QueryCtx | MutationCtx,
    roomId: Id<"rooms">,
    userId: string
) {
    const membership = await ctx.db
        .query("members")
        .withIndex("by_roomId_userId", (q) =>
            q.eq("roomId", roomId).eq("userId", userId)
        )
        .first();

    if (!membership) {
        throw new Error("Not authorized: User is not a member of this room");
    }
    return membership;
}

/**
 * Throws if the specific user is not the owner of the room.
 */
export async function assertRoomOwner(
    ctx: QueryCtx | MutationCtx,
    roomId: Id<"rooms">,
    userId: string
) {
    const membership = await assertRoomMember(ctx, roomId, userId);

    if (membership.role !== "owner") {
        throw new Error("Not authorized: User is not the owner of this room");
    }
    return membership;
}

export const getCurrentUser = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null;
    }
    return identity.subject; // This is the Clerk userId
};
