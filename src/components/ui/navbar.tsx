/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { Button } from "./button";
import { Home, LogOut, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/formvalidation";
import { BoxAlert, ConfirmAlert } from "@/lib/alert";
import useSWR from "swr";
import Loading from "@/app/loading";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { data: ronde, isLoading: loading1 } = useSWR("/api/ronde", fetcher);

  if(loading1) return <Loading />

  const handleLogout = async () => {
    const response = await ConfirmAlert(
      "Apakah anda yakin ingin logout?",
      "warning"
    );
    if (response) {
      await logout();
      BoxAlert("Berhasil Logout", "success", "success");
      router.push("/login");
    } 
  };

  const handleRound = (url: string) => {
    router.push(url);
  };

  return (
    <nav className="w-full bg-slate-100 rounded-md shadow-md p-3 flex justify-between gap-4 items-center">
      <section className="flex items-center gap-2">
        <Button asChild>
          <Link
            className={`${
              pathname === "/dashboard"
                ? "bg-blue-500 text-slate-200"
                : "text-slate-900 border"
            } shadow flex items-center gap-2`}
            href="/dashboard"
          >
            <Home /> <span className="hidden md:inline-block">Home</span>
          </Link>
        </Button>
        <Button asChild>
          <Link
            className={`${
              pathname === "/data-peserta"
                ? "bg-blue-500 text-slate-200"
                : "text-slate-900 border"
            } shadow flex items-center gap-2`}
            href="/data-peserta"
          >
            <Users />{" "}
            <span className="hidden md:inline-block">Data Peserta</span>
          </Link>
        </Button>
        <Button
          disabled={ronde?.message === "success" ? false : true}
          onClick={() => handleRound("/bracket")}
          className={`${
            pathname === "/bracket"
              ? "bg-blue-500 text-slate-200"
              : "text-slate-900 border"
          } shadow flex items-center gap-2 disabled:cursor-not-allowed cursor-pointer`}
        >
          Bracket
        </Button>
        <Button
          onClick={() => handleRound("/juara")}
          className={`${
            pathname === "/juara"
              ? "bg-blue-500 text-slate-200"
              : "text-slate-900 border"
          } shadow flex items-center gap-2 disabled:cursor-not-allowed cursor-pointer`}
        >
          Juara
        </Button>
      </section>
      <Button
        className="bg-red-500 text-slate-200 shadow flex items-center gap-2 cursor-pointer"
        onClick={handleLogout}
      >
        <LogOut /> <span className="hidden md:inline-block">Log out</span>
      </Button>
    </nav>
  );
};

export default Navbar;
