import { prisma } from "@/lib/prisma";
import CustomersClient from "./CustomersClient";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden md:inline">Add Customer</span>
          <span className="md:hidden">Add</span>
        </Link>
      </div>
      <CustomersClient customers={customers} />
    </div>
  );
}
