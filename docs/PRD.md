

# 📘 PRD — Product Requirements Document

**Product Name:** Raumie
**Product Type:** Private Room-Based Media Sharing App
**Platforms:** iOS & Android (Mobile only)
**Audience:** Friends & Family (Invite-only, private use)

---

## 1. Product Vision

Raumie is a **privacy-first, room-based media sharing app** built for close groups.
It enables friends and family to share photos, videos, memories, and reactions in **isolated private rooms**, with **real-time updates** and **strong privacy guarantees**.

There is **no public feed**, **no discovery**, and **no algorithm**.

> **Your rooms. Your moments.**

---

## 2. Goals & Principles

### Product Goals

* Enable effortless sharing of moments within trusted groups
* Guarantee room-level isolation (no data leakage)
* Make media feel *alive* through real-time updates
* Keep the UI calm, simple, and intimate
* Minimize bugs, complexity, and operational cost

### Core Principles

* Privacy by default
* Server-authoritative security
* Explicit ownership & permissions
* No unnecessary features
* Small-scale, high-trust usage

---

## 3. Target Users

* Friends and family
* Small private groups
* Expected scale: **15–20 users**
* App is **never public-facing**

---

## 4. Supported Platforms

* ✅ iOS
* ✅ Android
* ❌ Web (not supported)

---

## 5. Core User Flow

1. User logs in
2. User creates or joins a room using a unique room code
3. User uploads photos/videos (single or multiple) with captions
4. Media appears instantly for all room members
5. Members can comment, react, and download (if allowed)
6. Notifications are sent for new posts (room-level mute supported)

---

## 6. Functional Requirements

### A. Rooms

Each room:

* Has a unique, globally valid join code
* Has exactly one owner (admin)
* Can have multiple members
* Is accessible **only** via its join code
* Is completely isolated from other rooms

---

### B. Room Permissions (Owner-Controlled)

Room owners can:

* Decide who can post (owner only / everyone)
* Enable or disable media downloads
* Remove room members
* Delete any media in the room
* Delete the room entirely

---

### C. Media Posts

Media posts support:

* Photos & videos
* Multiple uploads at once
* Captions
* Optional comments
* Real-time appearance in the feed

Rules:

* Media persists forever unless deleted
* Media belongs to:

  * The uploading user
  * The room owner (override rights)

---

### D. Comments & Reactions

* Real-time comments
* Real-time reactions
* Post owner can:

  * Disable comments
  * Delete comments

---

### E. Notifications

Push notifications are sent for:

* New media posts
* New memory posts

Features:

* Per-room mute control
* Notifications respect user preferences

---

## 7. Advanced Features

### F. Temporary Rooms

Temporary rooms are **ephemeral, high-privacy spaces**.

Rules:

* Invite-only (friends only)
* Media downloads disabled
* Screenshots & screen recording blocked (best-effort)
* Room exists only while at least one member is actively viewing it

If active users = 0:

* Room is deleted immediately
* All media is deleted
* Encryption keys are revoked

---

### G. Friends

* Friends list is **derived**, not manual
* A user’s friends = users who share at least one room
* Friends are:

  * Grouped by shared rooms
  * Sorted by recent activity

---

### H. Memory Room

Each room contains a **Memory** feature.

* Any media can be added to memory
* Memory posts:

  * Are editable (captions, emojis)
  * Are visible to all room members
  * Exist for **24 hours**
* Posting a memory sends a notification

---

### I. Calendar Room

Each room has a calendar view.

Features:

* Media grouped by date
* Each day can be renamed (e.g., “Movie Night”)
* Access posts directly by date
* From calendar:

  * View posts
  * Comment
  * Add to memory

---

## 8. Privacy & Security Requirements (NON-NEGOTIABLE)

* No cross-room data access
* No accidental public exposure
* Backend-enforced authorization
* Media never publicly accessible
* Temporary rooms leave **no residual data**
* Privacy is prioritized over convenience

---

## 9. Non-Functional Requirements

* Smooth and predictable UI
* Real-time interactions feel instant
* Works reliably on poor networks
* Minimal operational and infrastructure cost
* Small, maintainable codebase
* Low bug surface area

---

## 10. Success Criteria

* Zero incidents of cross-room data leakage
* Room creation & joining works reliably
* Realtime updates feel instant
* No authentication-related crashes post Phase 2
* App remains usable with < 20 active users daily

---

## 11. Product Scope Boundaries

Out of scope (for now):

* Public sharing
* Web app
* Monetization
* Ads
* Discovery feeds
* Analytics on user content

---

## 12. Phase Lock

✅ Phase 0: Project setup
✅ Phase 1: Authentication & backend foundation
✅ Phase 2: Rooms & real-time interaction

Product scope is **locked** unless explicitly revisited.

---

