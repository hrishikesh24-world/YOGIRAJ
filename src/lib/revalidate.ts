import { revalidatePath } from "next/cache";

export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (e) {
    // Safe fallback if called outside Next.js request context
  }
}
