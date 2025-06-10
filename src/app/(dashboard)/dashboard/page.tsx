import Alert from "@/components/ui/alert"
import redis from "@/lib/redis"
import { Tillana } from "next/font/google"
import { cookies } from "next/headers"

const tillana = Tillana({
   subsets: ["latin"] ,
   weight: ["400"],
  })

export const metadata = {
  title: "Dashboard",
}

const Dashboard = async () => {
  const cookie = await cookies();
  const token = cookie.get("Session");
  const user = JSON.parse(await redis.get(`Session:${token?.value}`) as string);
  
  return (
    <section className="mt-5 p-4 lg:p-5 lg:ps-10">
      <h1 className={`text-3xl lg:text-4xl font-bold ${tillana.className} text-dump mb-2`}>TicTacToe Competition</h1>
      <Alert icon="info" header="Informasi"><p className="text-sm">Halo, <span className="font-bold">{user.username}</span> Selamat datang di TicTacToe Competition, Anda sudah terdaftar sebagai peserta, Pertandingan akan dimulai ketika sudah ada 16 peserta yang sudah mendaftar, Peserta akan diacak secara random, Dipertandingan ini terdapat 4 Ronde, Juara akan diumumkan pada akhir pertandingan</p></Alert>
    </section>
  )
}

export default Dashboard
