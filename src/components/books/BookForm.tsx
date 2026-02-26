"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookSchema } from "@/lib/validations";

const CATEGORIES = [
  "Technology",
  "Business",
  "Leadership",
  "Science",
  "Fiction",
  "History",
  "Psychology",
  "Self-Development",
  "Design",
  "Other",
];

interface BookFormProps {
  initialData?: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    cover: string | null;
    description: string | null;
    category: string | null;
    totalCopies: number;
  };
}

export function BookForm({ initialData }: BookFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    author: initialData?.author ?? "",
    isbn: initialData?.isbn ?? "",
    cover: initialData?.cover ?? "",
    description: initialData?.description ?? "",
    category: initialData?.category ?? "",
    totalCopies: initialData?.totalCopies ?? 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const parsed = BookSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const url = isEdit
      ? `/api/books/${initialData!.id}`
      : "/api/books";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (res.ok) {
      router.push("/admin/books");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors({ _form: data.error ?? "Something went wrong." });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="The Pragmatic Programmer"
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="David Thomas"
          />
          {errors.author && (
            <p className="text-xs text-destructive">{errors.author}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={form.isbn}
            onChange={(e) => set("isbn", e.target.value)}
            placeholder="9780135957059"
          />
          {errors.isbn && (
            <p className="text-xs text-destructive">{errors.isbn}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.category}
            onValueChange={(val) => set("category", val)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="totalCopies">Number of copies *</Label>
          <Input
            id="totalCopies"
            type="number"
            min={1}
            max={100}
            value={form.totalCopies}
            onChange={(e) => set("totalCopies", Number(e.target.value))}
          />
          {errors.totalCopies && (
            <p className="text-xs text-destructive">{errors.totalCopies}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input
            id="cover"
            value={form.cover}
            onChange={(e) => set("cover", e.target.value)}
            placeholder="https://covers.openlibrary.org/..."
          />
          {errors.cover && (
            <p className="text-xs text-destructive">{errors.cover}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A short description of the book..."
            rows={4}
          />
        </div>
      </div>

      {errors._form && (
        <p className="text-sm text-destructive">{errors._form}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Save changes" : "Add book"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
