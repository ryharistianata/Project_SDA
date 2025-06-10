import Card from "@/components/ui/card"
import redis from "@/lib/redis"
import { User } from "@/types/type"
import { Tillana } from "next/font/google"
import { cookies } from "next/headers"

const tillana = Tillana({
   subsets: ["latin"] ,
   weight: ["400"],
  })

export const metadata = {
  title: "Data Peserta",
}

const DataPeserta = async () => {
    const peserta: User[] = []
    const cookie = await cookies();
    const token = cookie.get("Session");
    const users = await redis.keys("User:*");
    for (const key of users) {
        const user: User = JSON.parse((await redis.get(key)) as string);
        peserta.push(user);
    }

    const user = JSON.parse(await redis.get(`Session:${token?.value}`) as string);

  return (
    <section className='mt-5 p-4 lg:p-5 lg:ps-10 overflow-x-hidden overflow-y-auto'>
      <h1 className={`text-4xl font-bold ${tillana.className} text-dump mb-2`}>Data Peserta</h1>
      <section className="mt-5 flex flex-wrap gap-5">
        {peserta.map((item, index) => (
          <Card key={index} user={user} peserta={item} />
        ))}
      </section>
    </section>
  )
}

export default DataPeserta
