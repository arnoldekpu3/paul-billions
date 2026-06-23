import menImg from "@/assets/cat-men.jpg";
import womenImg from "@/assets/cat-women.jpg";
import shoesImg from "@/assets/cat-shoes.jpg";
import bagsImg from "@/assets/cat-bags.jpg";
import watchesImg from "@/assets/cat-watches.jpg";
import accImg from "@/assets/cat-accessories.jpg";
import beltsImg from "@/assets/cat-belts.jpg";
import jewelryImg from "@/assets/cat-jewelry.jpg";

export type Category = {
  slug: string;
  name: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "men", name: "Men's Wear", image: menImg },
  { slug: "women", name: "Women's Wear", image: womenImg },
  { slug: "shoes", name: "Shoes", image: shoesImg },
  { slug: "bags", name: "Bags", image: bagsImg },
  { slug: "watches", name: "Watches", image: watchesImg },
  { slug: "accessories", name: "Accessories", image: accImg },
];

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  isNew?: boolean;
  isBest?: boolean;
};

const SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["40", "41", "42", "43", "44", "45"];
const COLORS = ["Black", "White", "Gold", "Brown"];

export const products: Product[] = [
  { slug: "tailored-black-suit", name: "Tailored Black Suit", price: 285000, category: "men", image: menImg, images: [menImg], sizes: SIZES, colors: ["Black", "Charcoal"], isNew: true, isBest: true },
  { slug: "ivory-silk-gown", name: "Ivory Silk Gown", price: 195000, category: "women", image: womenImg, images: [womenImg], sizes: SIZES, colors: ["Ivory", "Gold"], isNew: true, isBest: true },
  { slug: "italian-leather-oxford", name: "Italian Leather Oxford", price: 165000, category: "shoes", image: shoesImg, images: [shoesImg], sizes: SHOE_SIZES, colors: ["Black", "Brown"], isBest: true },
  { slug: "monogram-tote", name: "Monogram Tote", price: 145000, category: "bags", image: bagsImg, images: [bagsImg], sizes: ["One Size"], colors: COLORS, isBest: true },
  { slug: "classic-gold-watch", name: "Classic Gold Watch", price: 320000, category: "watches", image: watchesImg, images: [watchesImg], sizes: ["One Size"], colors: ["Gold", "Silver"], isNew: true },
  { slug: "luxe-leather-belt", name: "Luxe Leather Belt", price: 55000, category: "accessories", image: beltsImg, images: [beltsImg], sizes: ["S", "M", "L"], colors: ["Black", "Brown"] },
  { slug: "signature-cufflinks", name: "Signature Cufflinks", price: 48000, category: "accessories", image: jewelryImg, images: [jewelryImg], sizes: ["One Size"], colors: ["Gold", "Silver"], isNew: true },
  { slug: "premium-denim-jacket", name: "Premium Denim Jacket", price: 135000, category: "men", image: menImg, images: [menImg], sizes: SIZES, colors: ["Indigo", "Black"] },
  { slug: "satin-evening-clutch", name: "Satin Evening Clutch", price: 78000, category: "bags", image: bagsImg, images: [bagsImg], sizes: ["One Size"], colors: ["Black", "Gold"] },
  { slug: "stiletto-heels", name: "Stiletto Heels", price: 125000, category: "shoes", image: shoesImg, images: [shoesImg], sizes: ["36", "37", "38", "39", "40"], colors: ["Black", "Nude"], isNew: true },
  { slug: "cashmere-overcoat", name: "Cashmere Overcoat", price: 425000, category: "men", image: menImg, images: [menImg], sizes: SIZES, colors: ["Camel", "Black"], isBest: true },
  { slug: "pearl-drop-earrings", name: "Pearl Drop Earrings", price: 62000, category: "accessories", image: jewelryImg, images: [jewelryImg], sizes: ["One Size"], colors: ["Gold", "Silver"] },
];

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG");

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
