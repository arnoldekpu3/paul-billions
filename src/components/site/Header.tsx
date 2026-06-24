import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, User, Menu, X, Shield } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/contact", label: "Contact" },
  { to: "/account", label: "Account" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur border-b border-border"
          : "bg-white border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 lg:h-20">
          <button
            aria-label="Open menu"
            className="lg:hidden -ml-2 p-2"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="justify-self-center lg:justify-self-start">
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight">
              PAUL BILLIONS
            </span>
          </Link>

          <nav className="hidden lg:flex justify-center items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[12px] tracking-luxe uppercase text-foreground/70 hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground border-b border-gold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 justify-self-end">
            {isAdmin && (
              <Link to={"/admin" as any} aria-label="Admin" className="p-2 text-gold hover:text-foreground transition hidden sm:inline-flex" title="Admin dashboard">
                <Shield className="h-[18px] w-[18px]" />
              </Link>
            )}
            <Link to="/account" aria-label="Account" className="p-2 hover:text-gold transition hidden sm:inline-flex">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link to="/cart" aria-label="Cart" className="p-2 hover:text-gold transition">
              <ShoppingBag className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="font-display text-lg font-bold">PAUL BILLIONS</span>
              <button aria-label="Close" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-4 border-b border-border text-sm tracking-luxe uppercase"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
