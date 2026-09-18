import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Droplets, IndianRupee, TrendingDown, Users, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import DeleteTransactionButton from "./customers/[id]/DeleteTransactionButton";

export default async function Dashboard() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTxs = await prisma.transaction.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });

  const totalCansToday = todayTxs.reduce((acc, t) => acc + (t.cansDelivered ?? 0), 0);
  const totalBilledToday = todayTxs.reduce((acc, t) => acc + (t.deliveryAmount ?? 0), 0);
  const totalCollectedToday = todayTxs.reduce((acc, t) => acc + (t.paymentAmount ?? 0), 0);

  const customersWithDues = await prisma.customer.findMany({ where: { balance: { gt: 0 } } });
  const totalOutstanding = customersWithDues.reduce((acc, c) => acc + c.balance, 0);
  const customersServedToday = new Set(todayTxs.map((t) => t.customerId)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Cans Today" value={totalCansToday.toString()} icon={Droplets} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="Billed Today" value={`₹${totalBilledToday}`} icon={IndianRupee} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard label="Collected" value={`₹${totalCollectedToday}`} icon={TrendingDown} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard label="Total Dues" value={`₹${Math.round(totalOutstanding)}`} icon={Users} iconBg="bg-red-100" iconColor="text-red-600" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/deliveries" className="flex items-center justify-center gap-2 h-14 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Add Delivery
        </Link>
        <Link href="/outstanding" className="flex items-center justify-center gap-2 h-14 bg-white border-2 border-gray-200 text-gray-800 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors">
          <IndianRupee className="w-5 h-5" />
          Collect Payment
        </Link>
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Today's Activity</h2>
          <span className="text-sm text-gray-500">{customersServedToday} customers</span>
        </div>
        {todayTxs.length === 0 ? (
          <div className="py-12 text-center">
            <Droplets className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No deliveries yet today</p>
            <p className="text-gray-400 text-sm mt-1">Tap "Add Delivery" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayTxs.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 group">
                <div>
                  <p className="font-semibold text-gray-900">{t.customer.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.cansDelivered ? `${t.cansDelivered} cans` : ""}
                    {t.cansDelivered && t.paymentAmount ? " · " : ""}
                    {t.paymentAmount ? `₹${t.paymentAmount} paid` : ""}
                    {!t.cansDelivered && !t.paymentAmount ? t.type : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    {t.deliveryAmount ? <p className="font-bold text-gray-900">₹{t.deliveryAmount}</p> : null}
                    <p className={`text-xs font-medium ${t.newBalance > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      Bal: {t.newBalance < 0 ? `₹${Math.abs(t.newBalance)} (Adv)` : `₹${t.newBalance}`}
                    </p>
                  </div>
                  <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <DeleteTransactionButton id={t.id} requireConfirm={false} icon="minus" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}
