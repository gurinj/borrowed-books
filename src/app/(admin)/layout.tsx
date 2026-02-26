import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/nav/Navbar";
import { AdminSidebar } from "@/components/nav/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role,
        }}
      />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
