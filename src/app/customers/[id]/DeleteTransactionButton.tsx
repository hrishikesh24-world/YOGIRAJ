"use client";

import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transactions";
import { useState } from "react";

export default function DeleteTransactionButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this transaction? All subsequent balances will be recalculated.")) {
      setLoading(true);
      try {
        await deleteTransaction(id);
      } catch (err) {
        alert("Error deleting transaction");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button 
      disabled={loading}
      onClick={handleDelete}
      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
