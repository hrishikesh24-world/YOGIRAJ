"use client";

import { updateBusinessSettings } from "@/app/actions/settings";
import { useState } from "react";

export default function SettingsClient({ business }: { business: any }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateBusinessSettings(formData);
      setMsg("Settings saved successfully.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
      {msg && <div className="bg-green-50 text-green-700 p-3 rounded-lg font-medium">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input required type="text" name="name" defaultValue={business.name} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input required type="tel" name="phone" defaultValue={business.phone} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea name="address" defaultValue={business.address} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Price/Can</label>
            <input required type="number" name="defaultPrice" defaultValue={business.defaultPrice} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input required type="text" name="currency" defaultValue={business.currency} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold rounded-xl py-3 hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <div className="pt-6 border-t mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Data Export</h2>
        <p className="text-sm text-gray-500 mb-4">Download a CSV backup of your customer data.</p>
        <a href="/api/export" className="inline-block w-full text-center bg-gray-100 text-gray-700 font-bold rounded-xl py-3 hover:bg-gray-200 transition-colors">
          Download CSV Backup
        </a>
      </div>
    </div>
  );
}
