/**
 * Remove undefined fields from an object before writing to Firestore.
 * Firestore rejects documents with undefined values.
 * Recursively cleans nested objects.
 */
export function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const cleaned = {} as any
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = cleanForFirestore(value)
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map((item) =>
        item !== null && typeof item === 'object' ? cleanForFirestore(item) : item
      )
    } else {
      cleaned[key] = value
    }
  }
  return cleaned
}