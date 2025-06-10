import { Loader } from "lucide-react"

const Loading = () => {
  return (
    <section className="flex absolute top-0 left-0 right-0 bottom-0 flex-col items-center justify-center gap-6">
        <h1 className="text-2xl">Sedang Memuat</h1>
        <Loader size={40} className="animate-spin"/>
    </section>
  )
}

export default Loading
