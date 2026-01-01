/**
 * Comment Service - Comments on reviews
 */
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Comment } from "../types"

export async function getComments(reviewId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "comments"),
    where("reviewId", "==", reviewId),
    where("status", "==", "active"),
    orderBy("createdAt", "asc")
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      reviewId: data.reviewId,
      userId: data.userId,
      userDisplayName: data.userDisplayName,
      userAvatar: data.userAvatar || null,
      text: data.text,
      status: data.status || "active",
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  })
}

export interface AddCommentInput {
  reviewId: string
  userId: string
  userDisplayName: string
  userAvatar: string | null
  text: string
}

export async function addComment(input: AddCommentInput): Promise<string> {
  const commentRef = doc(collection(db, "comments"))

  await setDoc(commentRef, {
    ...input,
    status: "active",
    createdAt: serverTimestamp(),
  })

  // Increment review's comment count
  const reviewRef = doc(db, "communityReviews", input.reviewId)
  await increment_field(reviewRef, "commentCount", 1)

  return commentRef.id
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  const commentRef = doc(db, "comments", commentId)
  const commentSnap = await getDoc(commentRef)

  if (!commentSnap.exists()) throw new Error("Comment not found")

  const data = commentSnap.data()
  if (data.userId !== userId) throw new Error("Not authorized")

  await deleteDoc(commentRef)

  // Decrement review's comment count
  const reviewRef = doc(db, "communityReviews", data.reviewId)
  await increment_field(reviewRef, "commentCount", -1)
}

// Helper to update doc field
async function increment_field(docRef: ReturnType<typeof doc>, field: string, value: number) {
  const { updateDoc, increment } = await import("firebase/firestore")
  await updateDoc(docRef, { [field]: increment(value) }).catch(() => {})
}
