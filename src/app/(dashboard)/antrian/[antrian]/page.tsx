import CardBracket from "@/components/ui/cardBracket";
import { getData } from "@/lib/database";

const Antrian = async ({
    params
}: { params: Promise<{ antrian: string }> }) => {
    const { antrian } = await params;
    const { data } = getData(`Antrian:${antrian}`);

  return (
    <section className="mt-5 lg:p-5 lg:ps-10 overflow-x-hidden overflow-y-auto">
      <h1
        className={`text-4xl font-bold tillana-regular text-center lg:text-start text-dump mb-5`}
      >
        Antrian {antrian}
      </h1>
      <CardBracket peserta={data} ronde={antrian} folder={"Antrian"} />
    </section>
  );
};

export default Antrian;
