"use client";

import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transactions";
import { useState } from "react";

export default function DeleteTransactionButton({ 
  id, 
  requireConfirm = true,
  icon = "trash"
}: { 
  id: string;
  requireConfirm?: boolean;
  icon?: "trash" | "minus"
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!requireConfirm || confirm("Are you sure you want to delete this transaction? All subsequent balances will be recalculated.")) {
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
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center ${
        icon === "minus" 
          ? "bg-red-50 text-red-600 hover:bg-red-100" 
          : "text-red-500 hover:bg-red-50"
      }`}
      title="Delete this entry"
    >
      {icon === "minus" ? (
        <span className="text-lg font-bold leading-none w-4 h-4 flex items-center justify-center">−</span>
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
