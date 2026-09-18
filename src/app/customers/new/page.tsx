import { addCustomer } from "@/app/actions/customers";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/customers" className="p-2 bg-white border rounded-full hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form action={addCustomer} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required type="text" name="name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input required type="tel" name="phone" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Price/Can (₹) *</label>
              <input required type="number" name="defaultPrice" defaultValue={40} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (₹)</label>
              <input type="number" name="openingBalance" defaultValue={0} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded-xl py-3 hover:bg-blue-700 transition-colors">
            Save Customer
          </button>
        </form>
      </div>
    </div>
  );
}
