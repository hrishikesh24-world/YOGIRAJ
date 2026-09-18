"use client";

import { useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DailyDelivery {
  date: string;
  cans: number;
  rate: number;
  amount: number;
}

interface Props {
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string | null;
    area: string | null;
  };
  business: {
    name: string;
    phone: string;
    address: string;
  };
  month: string;
  monthValue: string;
  openingBalance: number;
  totalCans: number;
  totalBilled: number;
  totalPaid: number;
  closingBalance: number;
  dailyDeliveries: DailyDelivery[];
  customerId: string;
}

export default function BillClient({
  customer,
  business,
  month,
  monthValue,
  openingBalance,
  totalCans,
  totalBilled,
  totalPaid,
  closingBalance,
  dailyDeliveries,
  customerId,
}: Props) {
  const router = useRouter();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      router.push(`/customers/${customerId}/bill?month=${e.target.value}`);
    }
  };

  const fmt = (n: number) => `₹${Math.round(n * 100) / 100}`;

  const handleDownloadPDF = async () => {
    const element = document.getElementById("bill-content");
    if (!element) return;
    
    // Import dynamically to avoid SSR issues
    const html2pdf = (await import("html2pdf.js")).default;
    
    const opt = {
      margin: 10,
      filename: `Bill_${customer.name}_${monthValue}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };
    
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Controls — hidden on print */}
      <div className="print:hidden flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Link href={`/customers/${customerId}`} className="p-2 border rounded-xl hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <p className="text-xs text-gray-500 font-medium">Billing Month</p>
            <input
              type="month"
              defaultValue={monthValue}
              onChange={handleMonthChange}
              className="text-gray-900 font-semibold text-sm border border-gray-300 rounded-lg px-3 py-1 mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors justify-center"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors justify-center"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* ── PRINTABLE BILL ── */}
      <div
        id="bill-content"
        className="bg-white border border-gray-200 rounded-xl p-8 print:rounded-none print:border-none print:shadow-none print:p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-5 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            {business.address && <p className="text-gray-600 text-sm mt-0.5">{business.address}</p>}
            {business.phone && <p className="text-gray-600 text-sm">📞 {business.phone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Bill / Statement</p>
            <p className="text-lg font-bold text-gray-900">{month}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Bill To</p>
          <p className="text-xl font-bold text-gray-900">{customer.name}</p>
          {customer.address && <p className="text-gray-600 text-sm">{customer.address}</p>}
          {customer.area && <p className="text-gray-500 text-sm">{customer.area}</p>}
          <p className="text-gray-500 text-sm">📞 {customer.phone}</p>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">Opening Balance</p>
            <p className={`text-lg font-bold mt-0.5 ${openingBalance > 0 ? "text-red-600" : "text-gray-900"}`}>
              {fmt(openingBalance)}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">Cans Delivered</p>
            <p className="text-lg font-bold mt-0.5 text-blue-700">{totalCans}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">Water Charges</p>
            <p className="text-lg font-bold mt-0.5 text-gray-900">{fmt(totalBilled)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 font-medium">Payments Received</p>
            <p className="text-lg font-bold mt-0.5 text-emerald-700">{fmt(totalPaid)}</p>
          </div>
        </div>

        {/* Daily Delivery Table */}
        {dailyDeliveries.length > 0 ? (
          <div className="mb-6">
            <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Delivery Details</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Bottles</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Rate</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dailyDeliveries.map((d, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2.5 text-gray-700">{d.date}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-blue-700">{d.cans}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">₹{d.rate}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">₹{d.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t border-gray-200">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-gray-900">Total</td>
                    <td className="px-4 py-2.5 text-center font-bold text-blue-700">{totalCans}</td>
                    <td></td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">₹{totalBilled}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-6 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No deliveries recorded for {month}</p>
          </div>
        )}

        {/* Final Balance */}
        <div className="border-2 border-dashed rounded-xl p-5" style={{ borderColor: closingBalance > 0 ? "#fca5a5" : "#6ee7b7" }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-600">FINAL OUTSTANDING BALANCE</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Balance carried forward to next month
              </p>
            </div>
            <p className={`text-3xl font-bold ${closingBalance > 0 ? "text-red-600" : closingBalance < 0 ? "text-emerald-600" : "text-gray-900"}`}>
              {closingBalance < 0 ? `${fmt(Math.abs(closingBalance))} Adv` : fmt(closingBalance)}
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Thank you for your business! — {business.name}
        </p>
      </div>
    </div>
  );
}
