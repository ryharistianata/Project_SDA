/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import Link from "next/link";
import { Button } from "./button";
import { Home, LogOut, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/formvalidation";
import { BoxAlert, ConfirmAlert } from "@/lib/alert";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    
    const handleLogout = async () => {
        try {
            const response = await ConfirmAlert("Apakah anda yakin ingin logout?", "warning");
            if(response) {
                await logout();
                BoxAlert("Berhasil Logout", "success", "success");
                router.push("/login");
            };
        } catch(error) {
            console.log(error);
        }
    }

    const handleRound = (url: string) => {
        router.push(url);
    }
    
  return (
    <nav className="w-full bg-slate-100 rounded-md shadow-md p-3 flex justify-between gap-4 items-center">
      <section className="flex items-center gap-2">
        <Button asChild>
          <Link
            className={`${pathname === "/dashboard" ? "bg-blue-500 text-slate-200" : "text-slate-900 border"} shadow flex items-center gap-2`}
            href="/dashboard"
          >
            <Home /> <span className="hidden md:inline-block">Home</span>
          </Link>
        </Button>
        <Button asChild>
          <Link
            className={`${pathname === "/data-peserta" ? "bg-blue-500 text-slate-200" : "text-slate-900 border"} shadow flex items-center gap-2`}
            href="/data-peserta"
          >
            <Users /> <span className="hidden md:inline-block">Data Peserta</span>
          </Link>
        </Button>
        <Button disabled onClick={() => handleRound("/main/round1")} className={`${pathname === "/main/round1" ? "bg-blue-500 text-slate-200" : "text-slate-900 border"} shadow flex items-center gap-2 disabled:cursor-not-allowed`}>
          R1
        </Button>
        <Button disabled onClick={() => handleRound("/main/round2")} className={`${pathname === "/main/round2" ? "bg-blue-500 text-slate-200" : "text-slate-900 border"} shadow flex items-center gap-2 disabled:cursor-not-allowed`}>
          R2
        </Button>
        <Button disabled onClick={() => handleRound("/main/round3")} className={`${pathname === "/main/round3" ? "bg-blue-500 text-slate-200" : "text-slate-900 border"} shadow flex items-center gap-2 disabled:cursor-not-allowed`}>
          R3
        </Button>
      </section>
      <Button className="bg-red-500 text-slate-200 shadow flex items-center gap-2 cursor-pointer" onClick={handleLogout}> 
          <LogOut /> <span className="hidden md:inline-block">Log out</span>
      </Button>
    </nav>
  );
};

export default Navbar;
