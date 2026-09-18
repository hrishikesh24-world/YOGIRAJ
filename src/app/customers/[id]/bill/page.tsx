import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import BillClient from "./BillClient";

export default async function CustomerBillPage({ params, searchParams }: { params: { id: string }, searchParams: { month?: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { business: true }
  });

  if (!customer) notFound();

  // Determine date range (default to current month)
  const targetDate = searchParams.month ? new Date(searchParams.month) : new Date();
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);

  // Fetch transactions for the period
  const transactions = await prisma.transaction.findMany({
    where: {
      customerId: customer.id,
      date: {
        gte: startDate,
        lte: endDate,
      }
    },
    orderBy: { date: 'asc' }
  });

  // Calculate totals for the period
  const totalCansPeriod = transactions.reduce((sum, t) => sum + (t.cansDelivered || 0), 0);
  const totalBilledPeriod = transactions.reduce((sum, t) => sum + (t.deliveryAmount || 0), 0);
  const totalPaidPeriod = transactions.reduce((sum, t) => sum + (t.paymentAmount || 0), 0);

  // Opening balance is the previousBalance of the FIRST transaction in the period, 
  // or current balance if no transactions exist in the period.
  let openingBalance = customer.balance;
  if (transactions.length > 0) {
    openingBalance = transactions[0].previousBalance;
  } else {
    // If no transactions in period, we need to find the last transaction BEFORE the period to get the balance
    const lastTxBefore = await prisma.transaction.findFirst({
      where: {
        customerId: customer.id,
        date: { lt: startDate }
      },
      orderBy: { date: 'desc' }
    });
    openingBalance = lastTxBefore ? lastTxBefore.newBalance : 0;
  }

  // Closing balance is opening + billed - paid
  const closingBalance = openingBalance + totalBilledPeriod - totalPaidPeriod;

  return (
    <BillClient 
      customer={customer}
      transactions={transactions}
      startDate={startDate}
      endDate={endDate}
      openingBalance={openingBalance}
      closingBalance={closingBalance}
      totalCans={totalCansPeriod}
      totalBilled={totalBilledPeriod}
      totalPaid={totalPaidPeriod}
    />
  );
}
