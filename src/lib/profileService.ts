/**
 * Profile Service - User profiles and follow relationships
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  increment,
  serverTimestamp,
  limit,
  runTransaction,
} from "firebase/firestore"
import { db } from "./firebase"
import type { UserProfile, ActivityType, ActivityFeedItem } from "../types"

// ============ Profile CRUD ============

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, "userProfiles", userId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  const data = docSnap.data()
  return {
    id: docSnap.id,
    displayName: data.displayName || "Anonymous",
    avatarUrl: data.avatarUrl || null,
    bio: data.bio || "",
    followerCount: data.followerCount || 0,
    followingCount: data.followingCount || 0,
    reviewCount: data.reviewCount || 0,
    isAdmin: data.isAdmin || false,
    createdAt: data.createdAt?.toDate() || new Date(),
  }
}

export async function createProfile(
  userId: string,
  displayName: string,
  avatarUrl: string | null = null
): Promise<void> {
  const docRef = doc(db, "userProfiles", userId)
  await setDoc(docRef, {
    displayName,
    avatarUrl,
    bio: "",
    followerCount: 0,
    followingCount: 0,
    reviewCount: 0,
    isAdmin: false,
    createdAt: serverTimestamp(),
  })
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "displayName" | "avatarUrl" | "bio">>
): Promise<void> {
  const docRef = doc(db, "userProfiles", userId)
  await updateDoc(docRef, updates)
}

// ============ Activity Feed ============

export async function addActivityItem(
  targetUserId: string,
  type: ActivityType,
  actorId: string,
  targetId: string,
  targetType: "review" | "user",
  preview: string | null = null
): Promise<void> {
  const actor = await getProfile(actorId)
  if (!actor) return

  const itemRef = doc(collection(db, "activityFeed", targetUserId, "items"))
  await setDoc(itemRef, {
    type,
    actorId,
    actorName: actor.displayName,
    actorAvatar: actor.avatarUrl,
    targetId,
    targetType,
    preview,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function fetchActivityFeed(
  userId: string,
  maxResults = 30
): Promise<ActivityFeedItem[]> {
  const q = query(
    collection(db, "activityFeed", userId, "items"),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  const feedItems: ActivityFeedItem[] = []

  for (const doc of snapshot.docs) {
    const data = doc.data()
    feedItems.push({
      id: doc.id,
      type: data.type,
      actorId: data.actorId,
      actorName: data.actorName,
      actorAvatar: data.actorAvatar || null,
      targetId: data.targetId,
      targetType: data.targetType,
      preview: data.preview || null,
      read: data.read || false,
      createdAt: data.createdAt?.toDate() || new Date(),
    })
  }

  return feedItems
}

// ============ Follow System ============

export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself")
  }

  const followId = `${followerId}_${followingId}`
  const followRef = doc(db, "follows", followId)

  await runTransaction(db, async (transaction) => {
    const followSnap = await transaction.get(followRef)
    if (followSnap.exists()) return // Already following

    transaction.set(followRef, {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    })

    // Update counts
    const followerProfile = doc(db, "userProfiles", followerId)
    const followingProfile = doc(db, "userProfiles", followingId)

    transaction.update(followerProfile, { followingCount: increment(1) })
    transaction.update(followingProfile, { followerCount: increment(1) })
  })

  // Notify the followed user
  await addActivityItem(
    followingId,
    "new_follower",
    followerId,
    followerId,
    "user",
    null
  )
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const followId = `${followerId}_${followingId}`
  const followRef = doc(db, "follows", followId)

  await runTransaction(db, async (transaction) => {
    const followSnap = await transaction.get(followRef)
    if (!followSnap.exists()) return

    transaction.delete(followRef)

    // Update counts
    const followerProfile = doc(db, "userProfiles", followerId)
    const followingProfile = doc(db, "userProfiles", followingId)

    transaction.update(followerProfile, { followingCount: increment(-1) })
    transaction.update(followingProfile, { followerCount: increment(-1) })
  })
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const followId = `${followerId}_${followingId}`
  const followSnap = await getDoc(doc(db, "follows", followId))
  return followSnap.exists()
}

export async function getFollowers(userId: string): Promise<UserProfile[]> {
  const q = query(
    collection(db, "follows"),
    where("followingId", "==", userId),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)

  const profiles: UserProfile[] = []
  for (const doc of snapshot.docs) {
    const profile = await getProfile(doc.data().followerId)
    if (profile) profiles.push(profile)
  }
  return profiles
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  const q = query(
    collection(db, "follows"),
    where("followingId", "==", userId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data().followerId)
}

export async function getFollowing(userId: string): Promise<UserProfile[]> {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", userId),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)

  const profiles: UserProfile[] = []
  for (const doc of snapshot.docs) {
    const profile = await getProfile(doc.data().followingId)
    if (profile) profiles.push(profile)
  }
  return profiles
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const q = query(collection(db, "follows"), where("followerId", "==", userId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data().followingId)
}


export async function getSuggestedUsers(
  currentUserId: string,
  maxResults = 5
): Promise<UserProfile[]> {
  // Get users the current user already follows
  const followingIds = await getFollowingIds(currentUserId)
  const excludeIds = new Set([currentUserId, ...followingIds])

  // Get active users (those with reviews, ordered by review count)
  const q = query(
    collection(db, "userProfiles"),
    orderBy("reviewCount", "desc"),
    limit(maxResults + excludeIds.size)
  )
  const snapshot = await getDocs(q)

  const profiles: UserProfile[] = []
  for (const doc of snapshot.docs) {
    if (profiles.length >= maxResults) break
    if (excludeIds.has(doc.id)) continue

    const data = doc.data()
    profiles.push({
      id: doc.id,
      displayName: data.displayName || "Anonymous",
      avatarUrl: data.avatarUrl || null,
      bio: data.bio || "",
      followerCount: data.followerCount || 0,
      followingCount: data.followingCount || 0,
      reviewCount: data.reviewCount || 0,
      isAdmin: data.isAdmin || false,
      createdAt: data.createdAt?.toDate() || new Date(),
    })
  }

  return profiles
}
