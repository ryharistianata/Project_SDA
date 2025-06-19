"use client";

import {
  Bracket as Brackets,
  // IRoundProps,
  Seed,
  SingleLineSeed,
  SeedItem,
  SeedTeam,
  IRenderSeedProps,
} from "react-brackets";
import React from "react";
import useSWR from "swr";
import Loading from "@/app/loading";
import Image from "next/image";

const CustomSeed = ({ seed, breakpoint }: IRenderSeedProps) => {
  const Wrapper = false ? SingleLineSeed : Seed;

  return (
    <>
      <Wrapper mobileBreakpoint={breakpoint} className="text-xs">
        <SeedItem className="!bg-blue-500 rounded-md shadow">
          <SeedTeam className={`!py-3 flex items-center justify-between border w-52`}>
            <section className="flex items-center gap-3">
              {seed.teams[0].gambar != "" && (
                <Image
                  src={seed.teams[0].gambar}
                  width={40}
                  height={50}
                  alt={seed.teams[0].namaTim || "Gambar"}
                  className="rounded-md shadow"
                />
              )}
              <h1>{seed.teams[0].name}</h1>
            </section>
            <p className={`text-xs w-10 h-8 flex items-center justify-center rounded-md bg-slate-800`}>
              {seed.teams[0].score}
            </p>
          </SeedTeam>
        </SeedItem>
      </Wrapper>
      {seed.teams[1] && (
        <Wrapper mobileBreakpoint={breakpoint} className="text-xs">
          <SeedItem className="!bg-blue-500 rounded-md shadow">
            <SeedTeam className={`!py-3 flex items-center justify-between border w-52`}>
              <section className="flex items-center gap-3">
                {seed.teams[1].gambar != "" && (
                  <Image
                    src={seed.teams[1].gambar}
                    width={40}
                    height={50}
                    alt={seed.teams[1].namaTim || "Gambar"}
                    className="rounded-md shadow"
                  />
                )}
                <h1>{seed.teams[1].name}</h1>
              </section>
              <p className={`text-xs w-10 h-8 flex items-center justify-center rounded-md bg-slate-800`}>
                {seed.teams[1].score}
              </p>
            </SeedTeam>
          </SeedItem>
        </Wrapper>
      )}
    </>
  );
};



const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const Bracket = () => {
  const { data, isLoading } = useSWR("/api/ronde", fetcher);
  const { data: repechange, isLoading: loading2 } = useSWR("/api/repechange", fetcher);
  if (isLoading || loading2) return <Loading />;
  const totalRepechange = repechange?.data?.map((seeds: any) => seeds?.teams).flat();

  return (
    <>
      <Brackets rounds={data.data} renderSeedComponent={CustomSeed} />
      <hr className="w-full h-1 bg-slate-900 my-5"/>
      <h1 className="poppins-bold text-xl">Repechange</h1>
      {totalRepechange > 1 && <Brackets rounds={repechange.data} renderSeedComponent={CustomSeed} />}
    </>
  );
};

export default Bracket;
