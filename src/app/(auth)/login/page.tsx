import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Advocate CRM Login
        </h1>

        <LoginForm />
      </div>
    </div>
  );
}
