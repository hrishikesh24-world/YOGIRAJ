"use client";

import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BillClient({
  customer,
  transactions,
  startDate,
  endDate,
  openingBalance,
  closingBalance,
  totalCans,
  totalBilled,
  totalPaid
}: any) {
  const router = useRouter();

  const handlePrint = () => {
    window.print();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // format YYYY-MM
    if (val) {
      router.push(`/customers/${customer.id}/bill?month=${val}-01`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Non-printable controls */}
      <div className="print:hidden flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Link href={`/customers/${customer.id}`} className="p-2 border rounded-full hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <input 
            type="month" 
            defaultValue={format(startDate, "yyyy-MM")}
            onChange={handleMonthChange}
            className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 w-full md:w-auto justify-center"
        >
          <Printer className="w-5 h-5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Printable Invoice Area */}
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.business?.name || "Water Deliveries"}</h1>
            <p className="text-gray-500 mt-1">{customer.business?.address}</p>
            <p className="text-gray-500">Phone: {customer.business?.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider">INVOICE</h2>
            <p className="text-gray-900 mt-2 font-medium">Period: {format(startDate, "MMM yyyy")}</p>
            <p className="text-sm text-gray-500">Date: {format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Bill To:</p>
          <p className="text-lg font-bold text-gray-900">{customer.name}</p>
          {customer.address && <p className="text-gray-700">{customer.address}</p>}
          <p className="text-gray-700">Phone: {customer.phone}</p>
        </div>

        {/* Summary Table */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-bold text-gray-900">Description</th>
                <th className="p-4 font-bold text-gray-900 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 text-gray-700">Opening Balance</td>
                <td className="p-4 text-gray-900 text-right">₹{openingBalance}</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Water Charges ({totalCans} cans delivered)</td>
                <td className="p-4 text-gray-900 text-right">+ ₹{totalBilled}</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700">Payments Received</td>
                <td className="p-4 text-green-600 text-right font-medium">- ₹{totalPaid}</td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t font-bold text-lg">
              <tr>
                <td className="p-4 text-gray-900">Final Outstanding Balance</td>
                <td className={`p-4 text-right ${closingBalance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  ₹{closingBalance}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Detailed Ledger (Optional) */}
        {transactions.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction Details</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-gray-900">Date</th>
                    <th className="p-3 text-gray-900">Type</th>
                    <th className="p-3 text-gray-900 text-right">Billed</th>
                    <th className="p-3 text-gray-900 text-right">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t: any) => (
                    <tr key={t.id}>
                      <td className="p-3 text-gray-700">{format(new Date(t.date), "dd MMM")}</td>
                      <td className="p-3 text-gray-700">
                        {t.cansDelivered ? `${t.cansDelivered} cans` : t.type}
                      </td>
                      <td className="p-3 text-gray-900 text-right">{t.deliveryAmount ? `₹${t.deliveryAmount}` : '-'}</td>
                      <td className="p-3 text-green-600 text-right">{t.paymentAmount ? `₹${t.paymentAmount}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center text-sm text-gray-500 border-t pt-8">
          <p>Thank you for your business!</p>
        </div>

      </div>
    </div>
  );
}
