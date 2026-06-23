import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white mt-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-14 grid gap-10 md:grid-cols-3 items-start">
        <div>
          <h3 className="font-display text-xl mb-3">PAUL BILLIONS</h3>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Luxury fashion, delivered to your door.
          </p>
          <div className="flex gap-4 text-white/70 mt-5">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><Twitter className="h-5 w-5" /></a>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-white/70">
          <h4 className="text-[11px] tracking-luxe uppercase text-gold mb-2">Explore</h4>
          <Link to="/shop" className="hover:text-gold">Shop</Link>
          <Link to="/categories" className="hover:text-gold">Categories</Link>
          <Link to="/contact" className="hover:text-gold">Contact</Link>
          <Link to="/account" className="hover:text-gold">My Account</Link>
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-white/70">
          <h4 className="text-[11px] tracking-luxe uppercase text-gold mb-2">Contact</h4>
          <span>hello@paulbillions.com</span>
          <span>+234 800 000 0000</span>
          <span>Lagos, Nigeria</span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-8 py-5 text-xs text-white/50 text-center">
          © {new Date().getFullYear()} PAUL BILLIONS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
