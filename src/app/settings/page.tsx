import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const business = await prisma.business.findFirst();
  if (!business) return <div>No business configured.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <SettingsClient business={business} />
    </div>
  );
}
