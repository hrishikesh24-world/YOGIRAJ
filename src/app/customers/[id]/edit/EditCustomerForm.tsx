"use client";

import { useState } from "react";
import { updateCustomer, deleteCustomer, adjustBalance } from "@/app/actions/customers";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";

export default function EditCustomerForm({ customer }: { customer: any }) {
  const router = useRouter();

  const [name, setName] = useState(customer.name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.address || "");
  const [area, setArea] = useState(customer.area || "");
  const [notes, setNotes] = useState(customer.notes || "");
  const [defaultPrice, setDefaultPrice] = useState<number>(customer.defaultPrice || 40);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [adjustingBalance, setAdjustingBalance] = useState(false);
  const [newBalanceStr, setNewBalanceStr] = useState(customer.balance.toString());
  const [balanceReason, setBalanceReason] = useState("");
  const [balanceSaving, setBalanceSaving] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateCustomer(customer.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        area: area.trim(),
        notes: notes.trim(),
        defaultPrice,
      });
      showSuccess("Customer details saved!");
      router.push(`/customers/${customer.id}`);
    } catch (err: any) {
      setError(err.message || "Error saving. Please try again.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCustomer(customer.id);
      router.push("/customers");
    } catch (err: any) {
      setError(err.message || "Error deleting customer.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAdjustBalance = async () => {
    const val = parseFloat(newBalanceStr);
    if (isNaN(val)) {
      setError("Please enter a valid number for balance.");
      return;
    }
    setBalanceSaving(true);
    setError("");
    try {
      await adjustBalance(customer.id, val, balanceReason || "Manual balance update");
      showSuccess(`Balance updated to ₹${val}`);
      setAdjustingBalance(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error updating balance.");
    } finally {
      setBalanceSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Feedback */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl font-medium text-sm">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 text-lg">Customer Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area / Locality</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price per Can (₹)</label>
            <input
              type="number"
              min="0"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this customer"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-base"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Adjust Balance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900">Current Balance</h2>
            <p className={`text-2xl font-bold mt-1 ${customer.balance > 0 ? "text-red-600" : customer.balance < 0 ? "text-emerald-600" : "text-gray-400"}`}>
              {customer.balance < 0
                ? `₹${Math.abs(customer.balance)} (Advance)`
                : customer.balance === 0
                ? "₹0 (Clear)"
                : `₹${customer.balance} (Due)`}
            </p>
          </div>
          <button
            onClick={() => setAdjustingBalance(!adjustingBalance)}
            className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-xl font-semibold text-sm hover:bg-orange-200 transition-colors"
          >
            {adjustingBalance ? "Cancel" : "Adjust Balance"}
          </button>
        </div>

        {adjustingBalance && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm text-gray-500">
              Type the correct outstanding amount. A balance-adjustment record will be saved in the ledger.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Balance Amount (₹)</label>
              <input
                type="number"
                value={newBalanceStr}
                onChange={(e) => setNewBalanceStr(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-4 py-3 border border-orange-300 rounded-xl text-gray-900 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Positive = customer owes you money · Negative = customer paid in advance
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason (optional)</label>
              <input
                type="text"
                value={balanceReason}
                onChange={(e) => setBalanceReason(e.target.value)}
                placeholder="e.g. Correcting opening balance"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={handleAdjustBalance}
              disabled={balanceSaving}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {balanceSaving ? "Saving…" : "Update Balance"}
            </button>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-bold text-gray-900 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently removes this customer and all their transaction history.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Customer
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700">Are you sure?</p>
                <p className="text-sm text-red-600">
                  This will permanently delete <strong>{customer.name}</strong> and all their transactions. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-11 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
