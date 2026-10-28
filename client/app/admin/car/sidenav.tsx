import Link from "next/link";
import { NavLinks } from "./nav-links";
import { Power } from "lucide-react";

export function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <div className="mb-2 flex h-20 items-center justify-center rounded-md bg-foreground p-4 md:h-40">
          <div className="w-32 text-background md:w-40">Admin Dashboard</div>
        </div>
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form>
          <Link href="/">
            <button className="flex h-12 w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 text-zinc-800">
              <Power className="w-6 " />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
