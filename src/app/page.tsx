"use client"

import { useEffect, useState } from "react";
import Introduction from "@/components/ui/Introduction";
import { useRouter } from "next/navigation";
import Loading from "./loading";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    if(localStorage.getItem("started")) {
      router.push("/login");
    };
    setLoading(false);
  }, [])

  return loading ? <Loading /> : <Introduction />;
  
}
