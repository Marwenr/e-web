import { Metadata } from "next";
import { CartPage } from "@/components/cart";

export const metadata: Metadata = {
  title: "Shopping Cart - MeubleTN",
  description: "Review your cart items and proceed to checkout",
};

export default function Cart() {
  return <CartPage />;
}

