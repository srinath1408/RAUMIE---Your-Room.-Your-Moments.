import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        userId: v.string(), // Clerk Subject ID
    }).index("by_userId", ["userId"]),

    rooms: defineTable({
        name: v.string(),
        type: v.union(v.literal("normal"), v.literal("temporary")),
        ownerId: v.string(),
        encryptionKeyId: v.string(), // Reference to key managed by clients
        code: v.string(), // Unique 6-char code
    })
        .index("by_code", ["code"])
        .index("by_ownerId", ["ownerId"]),

    members: defineTable({
        roomId: v.id("rooms"),
        userId: v.string(),
        role: v.union(v.literal("owner"), v.literal("member")),
    })
        .index("by_userId", ["userId"])
        .index("by_roomId", ["roomId"])
        .index("by_roomId_userId", ["roomId", "userId"]),

    media: defineTable({
        roomId: v.id("rooms"),
        storageId: v.id("_storage"), // Convex Storage ID
        type: v.union(v.literal("image"), v.literal("video")),
        mimeType: v.string(), // e.g. "image/jpeg"
        userId: v.string(), // Uploader
        encryption: v.object({
            iv: v.string(),
            keyVersion: v.optional(v.string()),
        }),
    })
        .index("by_roomId", ["roomId"]),
});
