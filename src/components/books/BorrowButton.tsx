"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BorrowButtonProps {
  bookId: string;
  isAvailable: boolean;
}

export function BorrowButton({ bookId, isAvailable }: BorrowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBorrow() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });

    if (res.ok) {
      router.push("/my-loans");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to borrow book. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBorrow}
        disabled={!isAvailable || loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <BookOpen className="w-4 h-4" />
        )}
        {loading ? "Borrowing..." : "Borrow this book"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
