import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/men", label: "Men" },
  { to: "/women", label: "Women" },
  { to: "/accessories", label: "Accessories" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-black text-white text-[11px] tracking-luxe uppercase py-2 text-center">
        Complimentary nationwide delivery on orders over ₦150,000
      </div>

      <header
        className={[
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-white border-b border-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 h-16 lg:h-20">
            {/* Mobile menu trigger */}
            <button
              aria-label="Open menu"
              className="lg:hidden -ml-2 p-2"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="justify-self-center lg:justify-self-start flex items-baseline gap-1.5 shrink-0"
            >
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                PAUL BILLIONS
              </span>
              <span className="hidden sm:inline text-[10px] tracking-luxe uppercase text-gold">
                &nbsp;Clothing & Accessories
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex justify-center items-center gap-7">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="text-[12px] tracking-luxe uppercase text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                  activeProps={{ className: "text-foreground after:!w-full" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1 sm:gap-2 justify-self-end">
              <button aria-label="Search" className="p-2 hover:text-gold transition">
                <Search className="h-[18px] w-[18px]" />
              </button>
              <a href="#" aria-label="Wishlist" className="p-2 hover:text-gold transition hidden sm:inline-flex">
                <Heart className="h-[18px] w-[18px]" />
              </a>
              <a href="#" aria-label="Account" className="p-2 hover:text-gold transition hidden sm:inline-flex">
                <User className="h-[18px] w-[18px]" />
              </a>
              <a href="#" aria-label="Cart" className="p-2 hover:text-gold transition relative">
                <ShoppingBag className="h-[18px] w-[18px]" />
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-black text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-lg font-bold">PAUL BILLIONS</span>
              <button aria-label="Close" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-3 border-b border-border text-sm tracking-luxe uppercase"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 flex flex-col gap-2">
              <a href="#" onClick={() => setOpen(false)} className="text-sm py-2">
                Customer Login
              </a>
              <a href="#" onClick={() => setOpen(false)} className="text-sm py-2 text-gold">
                Register Account
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
