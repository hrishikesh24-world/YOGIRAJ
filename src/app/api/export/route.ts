import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const customers = await prisma.customer.findMany();
  
  const csvRows = [
    ["ID", "Name", "Phone", "Address", "Default Price", "Balance", "Total Cans", "Total Billed", "Total Collected"].join(","),
    ...customers.map(c => [
      c.id,
      `"${c.name}"`,
      c.phone,
      `"${c.address || ''}"`,
      c.defaultPrice,
      c.balance,
      c.totalCans,
      c.totalBilled,
      c.totalCollected
    ].join(","))
  ];

  const csvContent = csvRows.join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="customers_export_${new Date().toISOString().split('T')[0]}.csv"`,
    }
  });
}
