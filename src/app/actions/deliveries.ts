"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addDelivery(data: {
  customerId: string;
  cans: number;
  pricePerCan: number;
  amountPaid: number;
  paymentMethod: string;
  notes?: string;
}) {
  const { customerId, cans, pricePerCan, amountPaid, paymentMethod, notes } = data;

  if (cans < 0) throw new Error("Cans cannot be negative");
  if (pricePerCan < 0) throw new Error("Price cannot be negative");
  if (amountPaid < 0) throw new Error("Payment cannot be negative");
  if (cans === 0 && amountPaid === 0) throw new Error("Must enter cans or payment");

  const deliveryAmount = Math.round(cans * pricePerCan * 100) / 100;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new Error("Customer not found");

  const previousBalance = Math.round(customer.balance * 100) / 100;
  const newBalance = Math.round((previousBalance + deliveryAmount - amountPaid) * 100) / 100;

  let txType = "DELIVERY";
  if (cans === 0 && amountPaid > 0) txType = "PAYMENT";
  else if (cans > 0 && amountPaid > 0) txType = "DELIVERY_AND_PAYMENT";

  let txNotes = notes || "";
  if (!txNotes) {
    if (cans > 0) txNotes = `${cans} cans @ ₹${pricePerCan}/can`;
    else txNotes = "Payment received";
  }

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: customerId },
      data: {
        balance: newBalance,
        totalCans: { increment: cans },
        totalBilled: { increment: deliveryAmount },
        totalCollected: { increment: amountPaid },
      },
    }),
    prisma.transaction.create({
      data: {
        customerId,
        type: txType,
        cansDelivered: cans > 0 ? cans : null,
        pricePerCan: cans > 0 ? pricePerCan : null,
        deliveryAmount: deliveryAmount > 0 ? deliveryAmount : null,
        paymentAmount: amountPaid > 0 ? amountPaid : null,
        paymentMethod: amountPaid > 0 ? paymentMethod : null,
        previousBalance,
        newBalance,
        notes: txNotes,
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/deliveries");
  revalidatePath("/customers");
  revalidatePath("/outstanding");

  return { success: true, newBalance };
}
