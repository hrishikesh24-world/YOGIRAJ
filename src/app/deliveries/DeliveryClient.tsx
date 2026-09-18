"use client";

import { useState } from "react";
import { addDelivery } from "../actions/deliveries";
import { Search, CheckCircle, X, ChevronRight } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  balance: number;
  defaultPrice: number | null;
  phone: string;
  area: string | null;
};

export default function DeliveryClient({
  customers,
  defaultCustomerId,
  defaultPrice,
}: {
  customers: Customer[];
  defaultCustomerId?: string;
  defaultPrice: number;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const initialCustomer = customers.find((c) => c.id === defaultCustomerId) ?? null;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer);
  const [cans, setCans] = useState<number>(0);
  const [pricePerCan, setPricePerCan] = useState<number>(
    initialCustomer?.defaultPrice ?? defaultPrice
  );
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const filtered = searchTerm
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm) ||
          (c.area ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;

  const handleSelect = (c: Customer) => {
    setSelectedCustomer(c);
    setPricePerCan(c.defaultPrice ?? defaultPrice);
    setCans(0);
    setAmountPaid(0);
    setNotes("");
    setSuccessMsg("");
    setError("");
  };

  const deliveryAmount = Math.round(cans * pricePerCan * 100) / 100;
  const newBalance = selectedCustomer
    ? Math.round((selectedCustomer.balance + deliveryAmount - amountPaid) * 100) / 100
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (cans === 0 && amountPaid === 0) {
      setError("Please enter number of cans or an amount paid.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await addDelivery({
        customerId: selectedCustomer.id,
        cans,
        pricePerCan,
        amountPaid,
        paymentMethod,
        notes,
      });
      if (res.success) {
        setSuccessMsg(
          `Saved! New balance: ${
            res.newBalance < 0
              ? `₹${Math.abs(res.newBalance)} (Advance)`
              : `₹${res.newBalance}`
          }`
        );
        setSelectedCustomer(null);
        setSearchTerm("");
        setCans(0);
        setAmountPaid(0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="space-y-3">
        {successMsg && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or area..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <p className="text-xs text-gray-500 px-1">
          Select a customer to add a delivery or record a payment
        </p>
        <div className="space-y-2">
          {filtered.slice(0, 12).map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm active:bg-gray-50 transition-all text-left"
            >
              <div>
                <p className="font-bold text-gray-900 text-base">{c.name}</p>
                <p className="text-sm text-gray-500">
                  {c.phone}
                  {c.area ? ` · ${c.area}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p
                    className={`font-bold text-sm ${
                      c.balance > 0
                        ? "text-red-600"
                        : c.balance < 0
                        ? "text-emerald-600"
                        : "text-gray-900"
                    }`}
                  >
                    {c.balance < 0 ? `₹${Math.abs(c.balance)} Adv` : `₹${c.balance}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>No customers found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Customer Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Customer</p>
          <p className="font-bold text-gray-900 text-lg leading-tight">{selectedCustomer.name}</p>
          <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Previous Balance</p>
            <p
              className={`font-bold text-xl ${
                selectedCustomer.balance > 0
                  ? "text-red-600"
                  : selectedCustomer.balance < 0
                  ? "text-emerald-600"
                  : "text-gray-900"
              }`}
            >
              {selectedCustomer.balance < 0
                ? `₹${Math.abs(selectedCustomer.balance)} Adv`
                : `₹${selectedCustomer.balance}`}
            </p>
          </div>
          <button
            onClick={() => setSelectedCustomer(null)}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cans + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cans Delivered</label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCans(Math.max(0, cans - 1))}
                  className="w-12 h-12 bg-gray-50 text-xl font-bold text-gray-700 hover:bg-gray-100 flex-shrink-0"
                >
                  −
                </button>
                <input
                  type="number"
                  min="0"
                  value={cans === 0 ? "" : cans}
                  placeholder="0"
                  onChange={(e) => setCans(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 h-12 text-center text-xl font-bold text-gray-900 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={() => setCans(cans + 1)}
                  className="w-12 h-12 bg-gray-50 text-xl font-bold text-gray-700 hover:bg-gray-100 flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per Can (₹)
              </label>
              <input
                type="number"
                min="0"
                value={pricePerCan || ""}
                placeholder={defaultPrice.toString()}
                onChange={(e) => setPricePerCan(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-gray-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bill preview */}
          <div className="flex justify-between items-center px-4 py-3 bg-blue-50 rounded-xl">
            <span className="font-semibold text-gray-700">Today's Bill</span>
            <span className="text-2xl font-bold text-blue-700">₹{deliveryAmount}</span>
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount Paid Now (₹)
            </label>
            <input
              type="number"
              min="0"
              value={amountPaid === 0 ? "" : amountPaid}
              placeholder="0"
              onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full h-12 px-4 border border-gray-300 rounded-xl text-gray-900 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment method */}
          {amountPaid > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["CASH", "UPI", "BANK", "OTHER"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`h-10 rounded-lg text-sm font-semibold border transition-colors ${
                      paymentMethod === m
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {m === "CASH" ? "Cash" : m === "UPI" ? "UPI" : m === "BANK" ? "Bank" : "Other"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note (optional)
            </label>
            <input
              type="text"
              value={notes}
              placeholder="E.g. advance, festival delivery…"
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Balance Preview */}
          <div
            className="flex justify-between items-center px-4 py-4 border-2 border-dashed rounded-xl"
            style={{
              borderColor:
                newBalance > 0 ? "#fca5a5" : newBalance < 0 ? "#6ee7b7" : "#e5e7eb",
            }}
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                New Balance
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  newBalance > 0
                    ? "text-red-600"
                    : newBalance < 0
                    ? "text-emerald-600"
                    : "text-gray-900"
                }`}
              >
                {newBalance < 0 ? `₹${Math.abs(newBalance)}` : `₹${newBalance}`}
              </p>
              {newBalance < 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">Advance payment</p>
              )}
              {newBalance === 0 && deliveryAmount > 0 && (
                <p className="text-xs text-gray-500 font-medium mt-0.5">Fully cleared ✓</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (cans === 0 && amountPaid === 0)}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition-colors shadow-sm"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
