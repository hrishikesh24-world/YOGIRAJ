"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const defaultPrice = parseFloat(formData.get("defaultPrice") as string);
  const openingBalance = parseFloat(formData.get("openingBalance") as string) || 0;

  // Just grab the first business since it's a single owner app
  const business = await prisma.business.findFirst();
  if (!business) throw new Error("Business not found");

  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      name,
      phone,
      address,
      defaultPrice,
      balance: openingBalance,
    }
  });

  if (openingBalance > 0) {
    await prisma.transaction.create({
      data: {
        customerId: customer.id,
        type: "OPENING_BALANCE",
        previousBalance: 0,
        newBalance: openingBalance,
        notes: "Initial Balance",
      }
    });
  }

  revalidatePath("/customers");
  redirect("/customers");
}
