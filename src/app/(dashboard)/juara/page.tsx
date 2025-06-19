"use client";

import Loading from "@/app/loading";
import Image from "next/image";
import { redirect } from "next/navigation";
import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json());

const Juara = () => {
  const { data: dataWin, isLoading: loading1 } = useSWR("/api/ronde/winner", fetcher);
  const { data: dataFin, isLoading: loading2 } = useSWR("/api/ronde/finals", fetcher);
  const { data: RepDataFin, isLoading: loading3 } = useSWR("api/repechange/winner", fetcher);
  
  if (loading1 || loading2 || loading3) return <Loading />;
  if(dataWin.message !== "success" || dataFin.message !== "success" || RepDataFin.message !== "success") return redirect("/");
  

  const juara1 = dataWin.data?.seeds[0]?.teams[0];
  const juara2 = dataFin.data?.seeds[0]?.teams.find(
    (item: any) => item.name !== juara1.name
  );
  const juara3 = RepDataFin.data?.seeds[0]?.teams[0];

  return (
    <section className="h-[calc(100vh-100px)] w-full overflow-hidden flex items-end justify-center">
      <section className="w-72 bg-blue-800 p-4 h-40 rounded-md shadow flex justify-center items-center flex-col relative">
        <section className="-top-45 absolute flex flex-col items-center gap-4">
          {juara2?.name != "" && (
            <Image
              src={juara2?.gambar}
              width={100}
              height={100}
              alt={juara2?.name}
              className="rounded-full w-30 h-30 border-2 shadow-perak border-slate-300"
            />
          )}
          <h1 className="text-2xl tillana-bold">{juara2?.name}</h1>
        </section>
        <h1 className="text-4xl poppins-semibold">2</h1>
      </section>
      <section className="w-72 bg-blue-400 p-4 h-60 rounded-md shadow flex justify-center items-center flex-col relative">
        {/* MAHKOTA */}
        <section className="-top-45 absolute flex flex-col items-center gap-4">
          {juara1?.name != "" && (
            <>
              <Image
                src="/mahkota.png"
                width={120}
                height={120}
                alt="Riki"
                className="absolute -top-8 -right-10 rotate-30"
              />
              <Image
                src={juara1?.gambar}
                width={100}
                height={100}
                alt={juara1?.name}
                className="rounded-full w-30 h-30 border-2 shadow-winner border-amber-300"
              />
            </>
          )}
          <h1 className="text-2xl tillana-bold">{juara1?.name}</h1>
        </section>
        <h1 className="text-4xl poppins-semibold">1</h1>
      </section>
      <section className="w-72 bg-blue-800 p-4 h-30 rounded-md shadow flex justify-center items-center flex-col relative">
        <section className="-top-45 absolute flex flex-col items-center gap-4">
          {juara3?.name != "" && (
            <Image
              src={juara3?.gambar}
              width={100}
              height={100}
              alt={juara3?.name}
              className="rounded-full w-30 h-30 border-2 shadow-perunggu border-[#CD7F32]"
            />
          )}
          <h1 className="text-2xl tillana-bold">{juara3?.name}</h1>
        </section>
        <h1 className="text-4xl poppins-semibold">3</h1>
      </section>
    </section>
  );
};

export default Juara;
