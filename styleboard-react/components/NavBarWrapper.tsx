"use client";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

const AUTH_ROUTES = ["/login", "/register"];

export default function NavBarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <>
      {!isAuthPage && <NavBar />}
      <main className={isAuthPage ? "" : "pt-16"}>
        {children}
      </main>
    </>
  );
}