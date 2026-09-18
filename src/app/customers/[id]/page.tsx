import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Droplets, Phone, MapPin, FileText, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import DeleteTransactionButton from "./DeleteTransactionButton";

const TYPE_LABELS: Record<string, string> = {
  DELIVERY: "Delivery",
  PAYMENT: "Payment",
  DELIVERY_AND_PAYMENT: "Delivery + Payment",
  OPENING_BALANCE: "Opening Balance",
  BALANCE_ADJUSTMENT: "Balance Adjusted",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { date: "desc" } },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/customers"
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{customer.name}</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Phone className="w-3 h-3" /> {customer.phone}
            {customer.area ? (
              <>
                <span className="mx-1">·</span>
                <MapPin className="w-3 h-3" />
                {customer.area}
              </>
            ) : (
              ""
            )}
          </p>
        </div>
        <Link
          href={`/customers/${id}/edit`}
          className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/deliveries?customer=${customer.id}`}
          className="flex items-center justify-center gap-2 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Delivery
        </Link>
        <Link
          href={`/customers/${customer.id}/bill`}
          className="flex items-center justify-center gap-2 h-12 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
        >
          <FileText className="w-5 h-5" />
          Generate Bill
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Balance Due</p>
          <p
            className={`text-xl font-bold ${
              customer.balance > 0
                ? "text-red-600"
                : customer.balance < 0
                ? "text-emerald-600"
                : "text-gray-900"
            }`}
          >
            {customer.balance < 0
              ? `₹${Math.abs(customer.balance)} Adv`
              : `₹${customer.balance}`}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Cans</p>
          <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-500" />
            {customer.totalCans}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Billed</p>
          <p className="text-xl font-bold text-gray-900">₹{Math.round(customer.totalBilled)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Paid</p>
          <p className="text-xl font-bold text-gray-900">₹{Math.round(customer.totalCollected)}</p>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900">Transaction Ledger</h2>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Date</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Cans</th>
                <th className="px-3 py-3">Rate</th>
                <th className="px-3 py-3 text-right">Charged</th>
                <th className="px-3 py-3 text-right">Paid</th>
                <th className="px-3 py-3 text-right">Balance</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customer.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(t.date), "dd MMM yy")}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.type === "PAYMENT"
                          ? "bg-emerald-100 text-emerald-700"
                          : t.type === "DELIVERY"
                          ? "bg-blue-100 text-blue-700"
                          : t.type === "DELIVERY_AND_PAYMENT"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {TYPE_LABELS[t.type] ?? t.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-700">{t.cansDelivered ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-700">
                    {t.pricePerCan ? `₹${t.pricePerCan}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-gray-900">
                    {t.deliveryAmount ? `₹${t.deliveryAmount}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-emerald-600">
                    {t.paymentAmount ? `₹${t.paymentAmount}` : "—"}
                  </td>
                  <td
                    className={`px-3 py-3 text-right font-bold ${
                      t.newBalance > 0
                        ? "text-red-600"
                        : t.newBalance < 0
                        ? "text-emerald-600"
                        : "text-gray-900"
                    }`}
                  >
                    {t.newBalance < 0
                      ? `₹${Math.abs(t.newBalance)} Adv`
                      : `₹${t.newBalance}`}
                  </td>
                  <td className="px-3 py-3">
                    <DeleteTransactionButton id={t.id} requireConfirm={false} icon="minus" />
                  </td>
                </tr>
              ))}
              {customer.transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {customer.transactions.map((t) => (
            <div key={t.id} className="px-4 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      t.type === "PAYMENT"
                        ? "bg-emerald-100 text-emerald-700"
                        : t.type === "DELIVERY"
                        ? "bg-blue-100 text-blue-700"
                        : t.type === "DELIVERY_AND_PAYMENT"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {TYPE_LABELS[t.type] ?? t.type}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(t.date), "dd MMM yyyy, h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={`font-bold ${
                      t.newBalance > 0
                        ? "text-red-600"
                        : t.newBalance < 0
                        ? "text-emerald-600"
                        : "text-gray-900"
                    }`}
                  >
                    {t.newBalance < 0
                      ? `₹${Math.abs(t.newBalance)} Adv`
                      : `₹${t.newBalance}`}
                  </p>
                  <DeleteTransactionButton id={t.id} requireConfirm={false} icon="minus" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {t.cansDelivered ? (
                  <div>
                    <p className="text-xs text-gray-400">Cans</p>
                    <p className="font-semibold text-gray-800">{t.cansDelivered}</p>
                  </div>
                ) : null}
                {t.deliveryAmount ? (
                  <div>
                    <p className="text-xs text-gray-400">Charged</p>
                    <p className="font-semibold text-gray-800">₹{t.deliveryAmount}</p>
                  </div>
                ) : null}
                {t.paymentAmount ? (
                  <div>
                    <p className="text-xs text-gray-400">Paid</p>
                    <p className="font-semibold text-emerald-600">₹{t.paymentAmount}</p>
                  </div>
                ) : null}
              </div>
              {t.notes && (
                <p className="text-xs text-gray-400 mt-1 italic">{t.notes}</p>
              )}
            </div>
          ))}
          {customer.transactions.length === 0 && (
            <div className="py-10 text-center text-gray-500">No transactions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
