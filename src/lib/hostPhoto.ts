import { envCollection, getAdminDb } from "@/lib/firebaseAdmin";
import { resolvePhotoSrc } from "@/lib/avatar";

// A host's icon follows their current profile photo rather than the copy saved when the lobby
// was created, so changing it on /profile shows up on the lobby page and in the directory.
// Cached briefly so frequent refetches don't each cost a users read.
const HOST_PHOTO_TTL_MS = 5 * 60_000;
// A "no photo" answer expires fast so a photo the host just uploaded shows up almost right away.
const HOST_PHOTO_MISS_TTL_MS = 20_000;
const hostPhotoCache = new Map<string, { src: string | null; at: number }>();

export async function currentHostPhoto(ownerUserId: string): Promise<string | null> {
  const cached = hostPhotoCache.get(ownerUserId);
  if (cached && Date.now() - cached.at < (cached.src ? HOST_PHOTO_TTL_MS : HOST_PHOTO_MISS_TTL_MS)) return cached.src;
  let src: string | null = null;
  try {
    const snap = await getAdminDb().collection(envCollection("users")).doc(ownerUserId).get();
    if (snap.exists) src = resolvePhotoSrc(snap.data() as FirebaseFirestore.DocumentData);
  } catch (error) {
    // A failed lookup just falls back to the photo saved on the lobby.
    console.error("Failed to load host photo", error);
  }
  hostPhotoCache.set(ownerUserId, { src, at: Date.now() });
  return src;
}
