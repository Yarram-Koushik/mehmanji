export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 py-12 font-sans selection:bg-[#C5A059] selection:text-white">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
