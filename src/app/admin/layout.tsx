import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
