/**
 * Moderation Service - Content reporting and admin actions
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
  serverTimestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"
import type {
  ModerationReport,
  ReportReason,
  ContentType,
  ReportAction,
} from "../types"

// ============ Reporting ============

export interface ReportContentInput {
  contentType: ContentType
  contentId: string
  reporterId: string
  reason: ReportReason
  details?: string
}

export async function reportContent(
  input: ReportContentInput
): Promise<string> {
  // Check if user already reported this content
  const existingReport = await getUserReportForContent(
    input.reporterId,
    input.contentId
  )
  if (existingReport) {
    throw new Error("You have already reported this content")
  }

  const reportRef = doc(collection(db, "moderationReports"))

  await setDoc(reportRef, {
    contentType: input.contentType,
    contentId: input.contentId,
    reporterId: input.reporterId,
    reason: input.reason,
    details: input.details || "",
    status: "pending",
    createdAt: serverTimestamp(),
  })

  return reportRef.id
}

async function getUserReportForContent(
  reporterId: string,
  contentId: string
): Promise<ModerationReport | null> {
  const q = query(
    collection(db, "moderationReports"),
    where("reporterId", "==", reporterId),
    where("contentId", "==", contentId)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return docToReport(doc)
}

// ============ Admin Functions ============

export async function getPendingReports(): Promise<ModerationReport[]> {
  const q = query(
    collection(db, "moderationReports"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => docToReport(doc))
}

export async function getAllReports(
  status?: "pending" | "reviewed" | "actioned"
): Promise<ModerationReport[]> {
  let q = query(
    collection(db, "moderationReports"),
    orderBy("createdAt", "desc")
  )

  if (status) {
    q = query(
      collection(db, "moderationReports"),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    )
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => docToReport(doc))
}

// ReportAction is imported from types

export async function actionReport(
  reportId: string,
  action: ReportAction
): Promise<void> {
  const reportRef = doc(db, "moderationReports", reportId)
  const reportSnap = await getDoc(reportRef)

  if (!reportSnap.exists()) throw new Error("Report not found")

  const reportData = reportSnap.data()

  // Update report status
  await updateDoc(reportRef, {
    status: action === "dismiss" ? "reviewed" : "actioned",
    actionTaken: action,
    actionedAt: serverTimestamp(),
  })

  // Take action on the content if not dismissed
  if (action !== "dismiss") {
    const contentRef = doc(
      db,
      getCollectionName(reportData.contentType),
      reportData.contentId
    )
    const contentSnap = await getDoc(contentRef)

    if (contentSnap.exists()) {
      await updateDoc(contentRef, {
        status: action === "hide" ? "hidden" : "removed",
      })
    }
  }
}

function getCollectionName(contentType: ContentType): string {
  switch (contentType) {
    case "review":
      return "communityReviews"
    case "comment":
      return "comments"
    case "profile":
      return "userProfiles"
    default:
      throw new RangeError(
        `Invalid contentType: "${contentType}". Expected one of: "review", "comment", "profile".`
      )
  }
}

function docToReport(docSnap: QueryDocumentSnapshot): ModerationReport {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    contentType: data.contentType,
    contentId: data.contentId,
    reporterId: data.reporterId,
    reason: data.reason,
    details: data.details || "",
    status: data.status,
    createdAt: data.createdAt?.toDate() || new Date(),
    actionTaken: data.actionTaken,
    actionedAt: data.actionedAt?.toDate() || undefined,
  }
}
