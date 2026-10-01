import type { Metadata } from "next";
import { MenuItemNotFoundClient } from "./not-found-client";

export const metadata: Metadata = {
  title: "Not Found",
  robots: { index: false, follow: false },
};

export default function MenuItemNotFound() {
  return <MenuItemNotFoundClient />;
}