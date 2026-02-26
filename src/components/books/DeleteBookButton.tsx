"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteBookButtonProps {
  bookId: string;
  activeLoans: number;
}

export function DeleteBookButton({
  bookId,
  activeLoans,
}: DeleteBookButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (activeLoans > 0) {
      alert(
        `This book has ${activeLoans} active loan(s). Return all copies before deleting.`
      );
      return;
    }
    if (!confirm("Are you sure you want to delete this book?")) return;

    setLoading(true);
    await fetch(`/api/books/${bookId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
