import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Ambuhub",
  description: "Log in or create an Ambuhub account.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
