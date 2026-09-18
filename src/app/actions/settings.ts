"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBusinessSettings(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const defaultPrice = parseFloat(formData.get("defaultPrice") as string);
  const currency = formData.get("currency") as string;

  const business = await prisma.business.findFirst();
  if (!business) throw new Error("Business not found");

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

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/customers/new");
  
  return { success: true };
}
