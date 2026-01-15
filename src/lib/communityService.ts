/**
 * Community Service - Reviews, likes, and activity feed
 */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  increment,
  serverTimestamp,
  runTransaction,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"
import type { CommunityReview } from "../types"
import { getFollowerIds, addActivityItem } from "./profileService"

// ============ Reviews ============

export async function fetchCommunityReviews(
  filterTag?: string,
  maxResults = 50
): Promise<CommunityReview[]> {
  const q = query(
    collection(db, "communityReviews"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  let reviews = snapshot.docs.map((doc) => docToReview(doc))

  // Client-side filter by vibe tag if specified
  if (filterTag) {
    reviews = reviews.filter((r) =>
      r.vibeTags.some((t) => t.toLowerCase().includes(filterTag.toLowerCase()))
    )
  }

  return reviews
}

export async function fetchUserReviews(
  userId: string
): Promise<CommunityReview[]> {
  const q = query(
    collection(db, "communityReviews"),
    where("userId", "==", userId),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => docToReview(doc))
}

export async function getReview(
  reviewId: string
): Promise<CommunityReview | null> {
  const docRef = doc(db, "communityReviews", reviewId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return docToReview(docSnap)
}

export interface SubmitReviewInput {
  userId: string
  userDisplayName: string
  userAvatar: string | null
  rawgId: number | null
  gameName: string
  gameImage: string | null
  rating: number
  reviewText: string
  vibeTags: string[]
}

export async function submitReview(input: SubmitReviewInput): Promise<string> {
  const reviewRef = doc(collection(db, "communityReviews"))

  await setDoc(reviewRef, {
    ...input,
    likeCount: 0,
    commentCount: 0,
    status: "active",
    createdAt: serverTimestamp(),
  })

  // Increment user's review count
  const userProfile = doc(db, "userProfiles", input.userId)
  await updateDoc(userProfile, { reviewCount: increment(1) }).catch(() => {})

  // Notify followers (Fan-out)
  const followerIds = await getFollowerIds(input.userId)
  const preview = `reviewed ${input.gameName}`

  // Batch writes would be better for scalability, but parallel promises are fine for MVP
  // Limit to first 50 followers to prevent massive write spikes in this version
  const notifyList = followerIds.slice(0, 50)

  await Promise.all(
    notifyList.map((followerId) =>
      addActivityItem(
        followerId,
        "new_review",
        input.userId,
        reviewRef.id,
        "review",
        preview
      )
    )
  )

  return reviewRef.id
}

export async function deleteReview(
  reviewId: string,
  userId: string
): Promise<void> {
  const reviewRef = doc(db, "communityReviews", reviewId)
  const reviewSnap = await getDoc(reviewRef)

  if (!reviewSnap.exists()) throw new Error("Review not found")
  if (reviewSnap.data().userId !== userId) throw new Error("Not authorized")

  await deleteDoc(reviewRef)

  // Decrement user's review count
  const userProfile = doc(db, "userProfiles", userId)
  await updateDoc(userProfile, { reviewCount: increment(-1) }).catch(() => {})
}

// ============ Likes ============

export async function likeReview(
  reviewId: string,
  userId: string
): Promise<void> {
  // Use deterministic ID to prevent duplicates
  const likeId = `${reviewId}_${userId}`
  const likeRef = doc(db, "likes", likeId)
  const reviewRef = doc(db, "communityReviews", reviewId)

  const reviewOwnerId = await runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef)
    if (likeSnap.exists()) return null // Already liked

    const reviewSnap = await transaction.get(reviewRef)
    if (!reviewSnap.exists()) throw new Error("Review not found")

    transaction.set(likeRef, {
      reviewId,
      userId,
      createdAt: serverTimestamp(),
    })
    transaction.update(reviewRef, { likeCount: increment(1) })

    return reviewSnap.data().userId as string
  })

  // Notify review owner (after transaction)
  if (reviewOwnerId && reviewOwnerId !== userId) {
    await addActivityItem(
      reviewOwnerId,
      "like",
      userId,
      reviewId,
      "review",
      null
    )
  }
}

export async function unlikeReview(
  reviewId: string,
  userId: string
): Promise<void> {
  const likeId = `${reviewId}_${userId}`
  const likeRef = doc(db, "likes", likeId)
  const reviewRef = doc(db, "communityReviews", reviewId)

  await runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef)
    if (!likeSnap.exists()) return // Not liked

    transaction.delete(likeRef)
    transaction.update(reviewRef, { likeCount: increment(-1) })
  })
}

export async function hasLikedReview(
  reviewId: string,
  userId: string
): Promise<boolean> {
  const likeId = `${reviewId}_${userId}`
  const likeSnap = await getDoc(doc(db, "likes", likeId))
  return likeSnap.exists()
}

// ============ Helpers ============

function docToReview(docSnap: QueryDocumentSnapshot): CommunityReview {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    userId: data.userId,
    userDisplayName: data.userDisplayName,
    userAvatar: data.userAvatar || null,
    rawgId: data.rawgId || null,
    gameName: data.gameName,
    gameImage: data.gameImage || null,
    rating: data.rating || 0,
    reviewText: data.reviewText || "",
    vibeTags: data.vibeTags || [],
    likeCount: data.likeCount || 0,
    commentCount: data.commentCount || 0,
    status: data.status || "active",
    createdAt: data.createdAt?.toDate() || new Date(),
  }
}
