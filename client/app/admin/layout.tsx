import { ReactNode } from "react";
import { SideNav } from "./car/sidenav";

type layout = {
  children: ReactNode;
};

export default function Layout({ children }: layout) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
