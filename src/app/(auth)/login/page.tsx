import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  // لو المستخدم مسجّل دخوله بالفعل → تحويل مباشر
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">Lumière</h1>
          <p className="text-muted text-sm">لوحة التحكم</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-muted mt-6">
          هذه الصفحة مخصصة لفريق العمل فقط
        </p>
      </div>
    </div>
  );
}