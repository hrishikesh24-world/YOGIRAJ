import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Phone, AlertCircle } from "lucide-react";

export default async function OutstandingPage() {
  const customers = await prisma.customer.findMany({
    where: { balance: { gt: 0 }, isActive: true },
    orderBy: { balance: "desc" },
  });

  const total = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outstanding Dues</h1>
        <p className="text-gray-500 text-sm">{customers.length} customers owe money</p>
      </div>

      <div className="bg-red-600 text-white rounded-2xl px-6 py-5">
        <p className="text-sm font-medium opacity-80">Total Outstanding</p>
        <p className="text-4xl font-bold mt-1">₹{Math.round(total)}</p>
      </div>

      <div className="space-y-2">
        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="flex items-center p-4 gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-red-600">{c.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{c.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {c.phone}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xl font-bold text-red-600">₹{Math.round(c.balance)}</p>
                <Link
                  href={`/deliveries?customer=${c.id}`}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors"
                >
                  Collect
                </Link>
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-600 text-lg">All clear!</p>
            <p className="text-gray-400 text-sm">No outstanding dues</p>
          </div>
        )}
      </div>
    </div>
  );
}
