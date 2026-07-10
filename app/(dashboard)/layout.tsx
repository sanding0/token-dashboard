import { AppSidebar } from "@/components/common/sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import WalletComponent from "@/components/wallet/wallet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex items-center justify-end gap-4 px-4">
          <SidebarTrigger className="md:hidden" />
          <WalletComponent />
        </header>
        {children}
      </SidebarInset>
    </>
  )
}