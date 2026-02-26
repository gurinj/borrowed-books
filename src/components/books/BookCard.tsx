import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string | null;
  category: string | null;
  availableCopies: number;
  totalCopies: number;
}

export function BookCard({ book }: { book: Book }) {
  const isAvailable = book.availableCopies > 0;

  return (
    <Link href={`/books/${book.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group cursor-pointer">
        {/* Cover */}
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          {book.cover ? (
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-300" />
            </div>
          )}
          {/* Availability badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={isAvailable ? "success" : "destructive"}>
              {isAvailable ? `${book.availableCopies} available` : "Borrowed"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {book.category && (
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
              {book.category}
            </p>
          )}
          <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">
            {book.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{book.author}</p>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <p className="text-xs text-slate-400">
            {book.availableCopies}/{book.totalCopies} copies available
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
