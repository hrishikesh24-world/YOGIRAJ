import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditCustomerForm from "./EditCustomerForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/customers/${id}`}
          className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
      </div>
      <EditCustomerForm customer={customer} />
    </div>
  );
}
