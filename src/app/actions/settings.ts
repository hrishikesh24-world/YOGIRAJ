"use server";

import { prisma } from "@/lib/prisma";
import { safeRevalidatePath } from "@/lib/revalidate";

export async function updateBusinessSettings(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const defaultPrice = parseFloat(formData.get("defaultPrice") as string);
  const currency = formData.get("currency") as string;

  let business = await prisma.business.findFirst();
  if (!business) {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: "Admin", email: "admin@example.com", password: "hashed_password" }
      });
    }
    business = await prisma.business.create({
      data: {
        userId: user.id,
        name: name || "YOGIRAJ",
        phone,
        address,
        defaultPrice: defaultPrice || 40,
        currency: currency || "INR",
      }
    });
  } else {
    await prisma.business.update({
      where: { id: business.id },
      data: {
        name,
        phone,
        address,
        defaultPrice,
        currency,
      }
    });
  }

  safeRevalidatePath("/");
  safeRevalidatePath("/settings");
  safeRevalidatePath("/customers/new");
  
  return { success: true };
}
