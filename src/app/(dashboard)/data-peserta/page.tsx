import ButtonMulai from "@/components/ui/buttonMulai";
import Card from "@/components/ui/card";
import { getData } from "@/lib/database";
import { User } from "@/types/type";
import { cookies } from "next/headers";

export const metadata = {
  title: "Data Peserta",
};

const DataPeserta = async () => {
  const cookie = await cookies();
  const token = cookie.get("Session");
  const { data: peserta }: { data: User[] } = getData("User");
  const { data: user }: { data: User } = getData(`Session:${token?.value}`);

  return (
    <section className="mt-5 lg:p-5 lg:ps-10 overflow-x-hidden overflow-y-auto">
      <h1
        className={`text-4xl font-bold tillana-regular text-center lg:text-start text-dump mb-5`}
      >
        Data Peserta
      </h1>
      <section className="mt-5 flex flex-wrap gap-5 justify-center lg:justify-start">
        {peserta.map((item: any, index: any) => (
          <Card key={index} user={user} peserta={item} />
        ))}
      </section>
      <ButtonMulai peserta={peserta} />
    </section>
  );
};

export default DataPeserta;
