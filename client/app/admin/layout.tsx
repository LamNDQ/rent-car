import { ReactNode } from "react";
import { MobileAdminNav, SideNav } from "./car/sidenav";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
          <SideNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="lg:hidden">
            <MobileAdminNav />
          </div>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
