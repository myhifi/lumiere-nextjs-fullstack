import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar
        user={{
          name: session.user.name ?? "مستخدم",
          role: session.user.role,
        }}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}