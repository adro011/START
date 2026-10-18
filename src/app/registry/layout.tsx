import type { ReactNode } from "react";
import "./registry.css";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function RegistryLayout({ children }: { children: ReactNode }) {
  return <div className="reg-scope">{children}</div>;
}
