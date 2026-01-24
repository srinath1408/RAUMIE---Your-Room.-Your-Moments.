

# 🛠️ TRD — Technical Requirements Document

**Project:** Raumie
**Product Type:** Private Room-Based Media Sharing App
**Platforms:** iOS & Android (Mobile only)
**Scale:** Small, private (15–20 users, not public)

---

## 1. Architecture Overview

Raumie follows a **mobile-first, privacy-first architecture** where:

* The **client handles UI, encryption, and user interaction**
* The **backend (Convex) is the single source of truth**
* **Authentication is enforced at the backend level**
* **Media is never publicly accessible**

### High-Level Flow

```
Mobile App (Expo / React Native)
   ├─ UI & Navigation
   ├─ Client-side encryption
   ├─ Media compression
   ↓
Authentication → Clerk (JWT)
   ↓
Realtime Backend → Convex
   ├─ Rooms
   ├─ Members
   ├─ Permissions
   ├─ Presence tracking
   ├─ Cleanup logic
   ↓
Encrypted Media → AWS S3 (Private)
   ├─ Signed URLs
   ├─ No public access
```

---

## 2. Technology Stack (Locked)

### Frontend

* Expo (React Native + TypeScript)
* Expo Router (file-based navigation)
* NativeWind / Tailwind (styling)
* Gesture-based UI
* Screen lifecycle awareness (foreground/background)

---

### Authentication

* **Clerk (Mobile SDK)**
* OAuth (Google / Apple)
* Session-based authentication
* JWT-based backend authorization

---

### Backend

* **Convex**
* Real-time database & subscriptions
* All business logic via Convex functions
* No direct client DB access
* Strong server-side authorization

---

### Media Storage

* **Convex File Storage (Built-in)**
* **Primary for Phase 3**
* AWS S3 reserved as future alternative for scale
* Media encrypted **before upload**

---

### Notifications

* Firebase Cloud Messaging (FCM)
* Expo Notifications as wrapper
* Event-driven from Convex

---

## 3. Authentication Architecture (FINAL & LOCKED)

### Overview

Authentication is handled via **Clerk-issued JWTs**, validated by Convex.

Due to current Clerk and Convex constraints, the system uses a **JWT Template-based integration**.

---

### Clerk Configuration

* A JWT Template named:

  ```
  convex
  ```
* Template type: **Convex**
* Audience: `convex` (automatically set by Clerk)
* No custom claims required
* No global audience allowlist used

This template exists **only** to satisfy Convex’s audience requirement.

---

### Convex Authentication Configuration

```ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

**Rationale:**

* `applicationID` is required by Convex auth schema
* Enforces correct audience validation
* Prevents unauthorized backend access

---

### Frontend Integration Rules

* `ClerkProvider` and `ConvexProviderWithClerk` are mounted **only once** at the app root
* Native `useAuth` hook is used
* No token interception, modification, or decoding
* No nested providers in feature layouts

---

## 4. Navigation & App Structure

```
app/
 ├─ (auth)/
 │   └─ login.tsx
 ├─ (tabs)/
 │   ├─ index.tsx      // Rooms list
 │   ├─ friends.tsx
 │   └─ _layout.tsx
 ├─ room/
 │   └─ [id].tsx       // Room feed
 ├─ create-room.tsx
 ├─ join-room.tsx
 ├─ _layout.tsx        // Root providers only
```

Rules:

* Root layout: providers only
* Feature layouts: navigation only
* No auth logic outside root

---

## 5. Backend Authorization Model

**All backend access is server-authoritative.**

For every query/mutation:

1. Validate authenticated user identity
2. Validate room membership
3. Validate role (owner/member)
4. Scope data strictly to room ID

❌ No global queries
❌ No client-trusted permissions
❌ No cross-room access

---

## 6. Data Model (High Level)

### Users

```ts
{
  userId: string,
  name?: string,
  email?: string,
}
```

### Rooms

```ts
{
  name: string,
  type: "normal" | "temporary",
  ownerId: string,
  createdAt: number,
}
```

### RoomMembers

```ts
{
  roomId: Id<"rooms">,
  userId: string,
  role: "owner" | "member",
}
```

### MediaPosts

```ts
{
  roomId: Id<"rooms">,
  storageId: string,
  type: "image" | "video",
  createdBy: string,
  createdAt: number,
}
```

### Comments / Reactions

```ts
{
  postId: Id<"media">,
  userId: string,
  content: string,
  createdAt: number,
}
```

### Memories

```ts
{
  roomId: Id<"rooms">,
  mediaIds: Id<"media">[],
  expiresAt: number,
}
```

### Presence (Temporary Rooms)

```ts
{
  roomId: Id<"rooms">,
  userId: string,
  lastActiveAt: number,
}
```

---

## 7. Temporary Rooms — Technical Behavior

* Presence tracked **only while room screen is active**
* Presence removed on:

  * Screen navigation
  * App background
  * App termination
* If active presence count reaches zero:

  * Room metadata deleted
  * All media deleted
  * S3 objects removed
  * Encryption keys invalidated

Cleanup is **server-driven**, never client-trusted.

---

## 8. Media & Encryption

* Each room has a unique encryption key
* Media encrypted on client before upload
* Server never sees plaintext media
* Keys revoked when:

  * User removed
  * Room deleted
  * Temporary room expires

Signed URLs:

* Short-lived
* Media-scoped
* Permission-aware (download allowed or not)

---

## 9. Screenshot & Screen Recording Protection

* Enabled **only** for temporary rooms
* Enforced at OS level where supported
* Best-effort protection (platform constraints acknowledged)

---

## 10. Environment Variables

### Expo

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
EXPO_PUBLIC_CONVEX_URL
```

### Convex

```
CLERK_JWT_ISSUER_DOMAIN
```

Secrets are never committed.

---

## 11. Non-Functional Guarantees

* Zero cross-room data leakage
* Realtime updates < perceived 200ms
* Graceful behavior on poor networks
* Minimal infrastructure cost
* Small operational surface area

---

## 12. Known Constraints & Decisions

* Clerk does not support global audience configuration for mobile apps
* Convex requires audience enforcement when `applicationID` exists
* JWT templates are required to bridge this gap
* This is a tooling constraint, not a product compromise

---

## 13. Phase Lock

✅ Phase 0: Project setup
✅ Phase 1: Auth & backend foundation
✅ Phase 2: Rooms & realtime
🔒 Auth architecture is **locked** unless explicitly redesigned

---
