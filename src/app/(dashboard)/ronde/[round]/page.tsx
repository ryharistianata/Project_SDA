import CardBracket from "@/components/ui/cardBracket";
import { getData } from "@/lib/database";

const Ronde = async ({ params }: { params: Promise<{ round: string }> }) => {
  const { round } = await params;
  const { data } = getData(`Ronde:${round}`);
  

  return (
    <section className="mt-5 lg:p-5 lg:ps-10 overflow-x-hidden overflow-y-auto">
      <h1
        className={`text-4xl font-bold tillana-regular text-center lg:text-start text-dump mb-5`}
      >
        Ronde {round}
      </h1>
      <CardBracket peserta={data} ronde={round} folder={"Ronde"} />
    </section>
  );
};

export default Ronde;
