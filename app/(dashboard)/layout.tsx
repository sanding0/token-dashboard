import { AppSidebar } from "@/components/common/sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import WalletComponent from "@/components/wallet/wallet";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <header className="
        sticky 
        top-0 
        z-20 
        flex
        shrink-0 
        items-center 
        gap-2 
        border-b 
        bg-background/95 
        px-3
        py-2
        box-border
        backdrop-blur 
        supports-backdrop-filter:bg-background/80
        sm:px-4"
        >
          <SidebarTrigger className="-ml-1 md:hidden" />
          <div className="min-w-0 flex-1" />
          <WalletComponent />
        </header>
        <main className="min-w-0 flex-1 p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </>
  )
}