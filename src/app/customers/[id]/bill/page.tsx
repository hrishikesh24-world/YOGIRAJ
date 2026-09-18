import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import BillClient from "./BillClient";

export default async function CustomerBillPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { business: true },
  });

  if (!customer) notFound();

  // Determine date range — default to current month
  let targetDate: Date;
  try {
    targetDate = resolvedSearchParams.month ? new Date(resolvedSearchParams.month + "-01") : new Date();
    if (isNaN(targetDate.getTime())) targetDate = new Date();
  } catch {
    targetDate = new Date();
  }

  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);

  // Fetch all delivery transactions for the month (ordered by date ASC)
  const transactions = await prisma.transaction.findMany({
    where: {
      customerId: customer.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  // Find opening balance (balance before the month starts)
  const lastTxBefore = await prisma.transaction.findFirst({
    where: {
      customerId: customer.id,
      date: { lt: startDate },
    },
    orderBy: { date: "desc" },
  });
  
  let openingBalance = 0;
  if (lastTxBefore) {
    openingBalance = lastTxBefore.newBalance;
  } else if (transactions.length > 0) {
    openingBalance = transactions[0].previousBalance;
  }

  // Period totals
  const totalCans = transactions.reduce((s, t) => s + (t.cansDelivered ?? 0), 0);
  const totalBilled = transactions.reduce((s, t) => s + (t.deliveryAmount ?? 0), 0);
  const totalPaid = transactions.reduce((s, t) => s + (t.paymentAmount ?? 0), 0);
  
  // Closing balance is the balance at the end of the month
  let closingBalance = openingBalance;
  if (transactions.length > 0) {
    closingBalance = transactions[transactions.length - 1].newBalance;
  }

  // Build month-wise data (in case user picks a wide range we still group by month)
  // For now: daily breakdown of deliveries
  const dailyDeliveries = transactions
    .filter((t) => (t.cansDelivered ?? 0) > 0)
    .map((t) => ({
      date: format(new Date(t.date), "dd MMM yyyy"),
      cans: t.cansDelivered ?? 0,
      rate: t.pricePerCan ?? 0,
      amount: t.deliveryAmount ?? 0,
    }));

  return (
    <BillClient
      customer={{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        area: customer.area,
      }}
      business={{
        name: customer.business?.name ?? "YOGIRAJ",
        phone: customer.business?.phone ?? "",
        address: customer.business?.address ?? "",
      }}
      month={format(targetDate, "MMMM yyyy")}
      monthValue={format(targetDate, "yyyy-MM")}
      openingBalance={openingBalance}
      totalCans={totalCans}
      totalBilled={totalBilled}
      totalPaid={totalPaid}
      closingBalance={closingBalance}
      dailyDeliveries={dailyDeliveries}
      customerId={customer.id}
    />
  );
}
