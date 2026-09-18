import { prisma } from "@/lib/prisma";
import DeliveryClient from "./DeliveryClient";

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const params = await searchParams;
  const business = await prisma.business.findFirst();
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    select: { id: true, name: true, balance: true, defaultPrice: true, phone: true, area: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Add Delivery / Payment</h1>
      <DeliveryClient
        customers={customers}
        defaultCustomerId={params.customer}
        defaultPrice={business?.defaultPrice ?? 40}
      />
    </div>
  );
}
