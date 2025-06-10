export function Judul({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>
) {
  return (
    <h1 className="scroll-m-20 border-b pb-2 text-5xl text-judul font-black text-slate-800 tracking-tight first:mt-0 text-dump">
      {children}
    </h1>
  )
}
