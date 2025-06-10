"use client";

import { Button } from "@/components/ui/button";
import { CornerDownRight } from "lucide-react";
import { useRouter } from "next/navigation";
import BlurText from "../Typography/BlurText";
import SplitText from "../Typography/SplitText";

export default function Introduction() {
  const router = useRouter();
  const handleClick = () => {
    localStorage.setItem("started", "true");
    router.push("/login");
  };

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-2">
      <BlurText
        text="TicTacToe Competition"
        delay={500}
        animateBy="words"
        direction="top"
        className="text-center font-black text-6xl text-dump"
      />
      <SplitText
        text="TicTacToe Competition is an online game where you can play against other
        players, Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sunt
        accusamus quam nulla expedita quasi ut, quos odit nihil magni iste quis
        hic nemo asperiores labore aliquam. Nihil neque hic saepe!"
        className="text-center text-sm mt-5 w-3/5"
        delay={20}
        duration={.4}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 20 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
      />
      <Button
        variant={"outline"}
        className="bg-slate-950 text-slate-200 mt-10 animate-bounce cursor-pointer"
        onClick={handleClick}
      >
        Get started <CornerDownRight strokeWidth={1.5} />
      </Button>
    </section>
  );
}
