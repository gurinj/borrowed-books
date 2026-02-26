"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReturnButton({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    await fetch(`/api/loans/${loanId}`, { method: "PUT" });
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReturn}
      disabled={loading}
      className="shrink-0"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RotateCcw className="w-3.5 h-3.5" />
      )}
      <span className="ml-1.5">Return</span>
    </Button>
  );
}
