"use server";

import { prisma } from "@/lib/prisma";
import { safeRevalidatePath } from "@/lib/revalidate";

export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const area = formData.get("area") as string;
  const defaultPrice = parseFloat(formData.get("defaultPrice") as string) || 40;
  const openingBalance = parseFloat(formData.get("openingBalance") as string) || 0;

  // Auto-get or create business to guarantee DB consistency
  let business = await prisma.business.findFirst();
  if (!business) {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Business Owner",
          email: "admin@example.com",
          password: "hashed_password",
        }
      });
    }
    business = await prisma.business.create({
      data: {
        userId: user.id,
        name: "YOGIRAJ",
        phone: "+91 98765 43210",
        address: "Main Water Depot",
        defaultPrice: 40,
        currency: "INR"
      }
    });
  }

  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      name,
      phone,
      address,
      area,
      defaultPrice,
      balance: openingBalance,
    },
  });

  if (openingBalance !== 0) {
    await prisma.transaction.create({
      data: {
        customerId: customer.id,
        type: "OPENING_BALANCE",
        previousBalance: 0,
        newBalance: openingBalance,
        notes: "Initial Balance",
      },
    });
  }

  safeRevalidatePath("/customers");
  safeRevalidatePath("/");
  safeRevalidatePath("/outstanding");
  return { success: true, id: customer.id };
}

export async function updateCustomer(id: string, data: {
  name: string;
  phone: string;
  address: string;
  area: string;
  notes: string;
  defaultPrice: number;
}) {
  if (!data.name || !data.phone) throw new Error("Name and phone are required");

  await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
      area: data.area,
      notes: data.notes,
      defaultPrice: data.defaultPrice,
    },
  });

  safeRevalidatePath("/customers");
  safeRevalidatePath(`/customers/${id}`);
  safeRevalidatePath("/");
  safeRevalidatePath("/outstanding");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  await prisma.transaction.deleteMany({ where: { customerId: id } });
  await prisma.customer.delete({ where: { id } });

  safeRevalidatePath("/customers");
  safeRevalidatePath("/");
  safeRevalidatePath("/outstanding");
  return { success: true };
}

export async function adjustBalance(customerId: string, newBalance: number, reason: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error("Customer not found");

  const previousBalance = customer.balance;

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: customerId },
      data: { balance: newBalance },
    }),
    prisma.transaction.create({
      data: {
        customerId,
        type: "BALANCE_ADJUSTMENT",
        previousBalance,
        newBalance,
        notes: reason || "Manual balance adjustment",
      },
    }),
  ]);

  safeRevalidatePath(`/customers/${customerId}`);
  safeRevalidatePath("/");
  safeRevalidatePath("/outstanding");
  safeRevalidatePath("/customers");
  return { success: true };
}
