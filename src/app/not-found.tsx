import { Button } from '@/components/ui/button'
import { ArrowLeft, SearchX } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <section className='flex justify-center items-center h-screen flex-col gap-5'>
        <h1 className='font-black text-9xl'>404</h1>
        <h2 className="text-2xl flex items-center gap-2">Halaman Tidak Ditemukan <SearchX size={35}/></h2>
        <Button className='bg-slate-950 text-slate-200 flex items-center gap-2' asChild>
            <Link href={"/dashboard"}>
                <ArrowLeft size={20}/> Kembali
            </Link>
        </Button>
    </section>
  )
}

export default NotFound
