import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Container } from "./Container";
import { Button } from "./Button";
import { useAuth } from "@app/hooks/useAuth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Cars", href: "/user/car" },
    { name: "Bookings", href: "/user/booking" },
    { name: "Chat support", href: "/chat"},
    ...(user?.role === "admin" ? [{ name: "Admin", href: "/admin/car" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-zinc-100">
                Car Rental
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={twMerge(
                    "text-sm font-medium transition-colors hover:text-zinc-100",
                    pathname === item.href ? "text-zinc-100" : "text-zinc-400",
                  )}>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-zinc-100">
                  {user.username}
                </Link>
                <Button variant="outline" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" as={Link} href="/login">
                  Login
                </Button>
                <Button variant="primary" as={Link} href="/register">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ?
                <X className="block h-6 w-6" aria-hidden="true" />
                : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                  pathname === item.href ?
                    "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                )}
                onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-zinc-800">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-zinc-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.username}
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    as={Link}
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    as={Link}
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
