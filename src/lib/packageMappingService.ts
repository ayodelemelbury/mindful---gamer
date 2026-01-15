import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
} from "firebase/firestore"
import { db } from "./firebase"

export interface PackageMapping {
  id: string
  packageName: string
  gameName: string
  rawgId: number | null
  contributorId: string
  voteCount: number
  reportCount: number
  status: "pending" | "verified" | "rejected"
  createdAt: Date
  verifiedAt: Date | null
}

const MAPPINGS_COLLECTION = "packageMappings"
const VOTES_COLLECTION = "packageMappingVotes"

let verifiedMappingsCache: Map<string, string> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000

export async function getVerifiedMappings(): Promise<Map<string, string>> {
  const now = Date.now()

  if (verifiedMappingsCache && now - cacheTimestamp < CACHE_TTL) {
    return verifiedMappingsCache
  }

  try {
    const q = query(
      collection(db, MAPPINGS_COLLECTION),
      where("status", "==", "verified"),
      orderBy("voteCount", "desc")
    )

    const snapshot = await getDocs(q)
    const mappings = new Map<string, string>()

    snapshot.forEach((doc) => {
      const data = doc.data()
      if (!mappings.has(data.packageName)) {
        mappings.set(data.packageName, data.gameName)
      }
    })

    verifiedMappingsCache = mappings
    cacheTimestamp = now

    console.log(`[PackageMappings] Loaded ${mappings.size} verified mappings`)
    return mappings
  } catch (error) {
    console.error("Error fetching verified mappings:", error)
    return verifiedMappingsCache || new Map()
  }
}

export async function contributeMapping(
  packageName: string,
  gameName: string,
  rawgId: number | null,
  userId: string
): Promise<string> {
  const existingQuery = query(
    collection(db, MAPPINGS_COLLECTION),
    where("packageName", "==", packageName),
    where("status", "in", ["pending", "verified"]),
    limit(1)
  )

  const existing = await getDocs(existingQuery)
  if (!existing.empty) {
    throw new Error("Mapping already exists for this package")
  }

  const docRef = await addDoc(collection(db, MAPPINGS_COLLECTION), {
    packageName,
    gameName,
    rawgId,
    contributorId: userId,
    voteCount: 1,
    reportCount: 0,
    status: rawgId ? "verified" : "pending",
    createdAt: Timestamp.now(),
    verifiedAt: rawgId ? Timestamp.now() : null,
  })

  verifiedMappingsCache = null

  return docRef.id
}

export async function voteOnMapping(
  mappingId: string,
  userId: string,
  vote: "up" | "down"
): Promise<void> {
  const voteQuery = query(
    collection(db, VOTES_COLLECTION),
    where("mappingId", "==", mappingId),
    where("userId", "==", userId),
    limit(1)
  )

  const existingVote = await getDocs(voteQuery)
  if (!existingVote.empty) {
    throw new Error("Already voted on this mapping")
  }

  await addDoc(collection(db, VOTES_COLLECTION), {
    mappingId,
    userId,
    vote,
    createdAt: Timestamp.now(),
  })

  const mappingRef = doc(db, MAPPINGS_COLLECTION, mappingId)
  await updateDoc(mappingRef, {
    voteCount: increment(vote === "up" ? 1 : -1),
  })

  verifiedMappingsCache = null
}

export async function reportMapping(
  mappingId: string
): Promise<void> {
  const mappingRef = doc(db, MAPPINGS_COLLECTION, mappingId)
  await updateDoc(mappingRef, {
    reportCount: increment(1),
  })
}

export function invalidateMappingsCache(): void {
  verifiedMappingsCache = null
  cacheTimestamp = 0
}
