import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white mt-24">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-gold mb-3">
              Join the community
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Be the first to discover<br />exclusive collections.
            </h2>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="flex-1 bg-transparent border border-white/30 px-5 py-4 text-sm placeholder:text-white/50 focus:border-gold focus:outline-none"
            />
            <button className="bg-gold text-black px-8 py-4 text-xs tracking-luxe uppercase font-semibold hover:bg-white transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-2xl mb-4">PAUL BILLIONS</h3>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            Premium clothing and accessories for individuals who appreciate quality, elegance, and timeless style.
          </p>
          <div className="flex gap-4 text-white/70">
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-gold"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>

        <FooterCol title="Shop">
          <FooterLink to="/men">Men</FooterLink>
          <FooterLink to="/women">Women</FooterLink>
          <FooterLink to="/accessories">Accessories</FooterLink>
          <FooterLink to="/new-arrivals">New Arrivals</FooterLink>
          <FooterLink to="/collections">Collections</FooterLink>
        </FooterCol>

        <FooterCol title="Customer Care">
          <FooterLink to="/contact">Contact Us</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/shipping">Shipping</FooterLink>
          <FooterLink to="/returns">Returns</FooterLink>
          <FooterLink to="/track">Track Order</FooterLink>
        </FooterCol>

        <FooterCol title="Company">
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms & Conditions</FooterLink>
        </FooterCol>
      </div>

      {/* Contact strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-xs text-white/60">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gold" /> +234 800 000 0000</span>
            <span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gold" /> hello@paulbillions.com</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gold" /> Lagos, Nigeria</span>
          </div>
          <p>© {new Date().getFullYear()} PAUL BILLIONS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] tracking-luxe uppercase text-gold mb-4">{title}</h4>
      <ul className="flex flex-col gap-2.5 text-sm text-white/70">{children}</ul>
    </div>
  );
}
function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="hover:text-gold transition-colors">{children}</Link>
    </li>
  );
}
