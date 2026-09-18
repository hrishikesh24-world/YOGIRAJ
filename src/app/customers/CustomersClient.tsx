"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Droplets, Phone } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  area: string | null;
  balance: number;
  totalCans: number;
  isActive: boolean;
};

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "dues" | "clear">("all");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.area ?? "").toLowerCase().includes(search.toLowerCase());

    if (filter === "dues") return matchesSearch && c.balance > 0;
    if (filter === "clear") return matchesSearch && c.balance <= 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone or area…"
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {(["all", "dues", "clear"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f === "all"
              ? `All (${customers.length})`
              : f === "dues"
              ? `With Dues (${customers.filter((c) => c.balance > 0).length})`
              : `Clear (${customers.filter((c) => c.balance <= 0).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            href={`/customers/${c.id}`}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold ${
                  c.balance > 0 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                }`}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {c.phone}
                  {c.area ? ` · ${c.area}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p
                  className={`font-bold ${
                    c.balance > 0
                      ? "text-red-600"
                      : c.balance < 0
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {c.balance < 0
                    ? `₹${Math.abs(c.balance)} Adv`
                    : c.balance === 0
                    ? "Clear"
                    : `₹${c.balance}`}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-0.5 justify-end">
                  <Droplets className="w-3 h-3" /> {c.totalCans} cans
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-gray-500">
            <p className="font-medium">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
