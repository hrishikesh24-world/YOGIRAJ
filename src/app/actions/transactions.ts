"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTransaction(transactionId: string) {
  // Get transaction
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx) throw new Error("Transaction not found");

  const customerId = tx.customerId;

  // Delete transaction
  await prisma.transaction.delete({ where: { id: transactionId } });

  // Recalculate ledger for the customer
  const allTxs = await prisma.transaction.findMany({
    where: { customerId },
    orderBy: { date: 'asc' }
  });

  let currentBalance = 0;
  let totalCans = 0;
  let totalBilled = 0;
  let totalCollected = 0;

  for (const t of allTxs) {
    const prev = currentBalance;
    const billed = t.deliveryAmount || 0;
    const paid = t.paymentAmount || 0;
    currentBalance = prev + billed - paid;

    totalCans += (t.cansDelivered || 0);
    totalBilled += billed;
    totalCollected += paid;

    if (t.previousBalance !== prev || t.newBalance !== currentBalance) {
      await prisma.transaction.update({
        where: { id: t.id },
        data: { previousBalance: prev, newBalance: currentBalance }
      });
    }
  }

  // Update customer summary
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      balance: currentBalance,
      totalCans,
      totalBilled,
      totalCollected,
    }
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/");
  
  return { success: true };
}
