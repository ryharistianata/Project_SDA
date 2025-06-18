import Navbar from "@/components/ui/navbar"

const LayoutDashboard = ({
    children,
}: Readonly<{children: React.ReactNode}>) => {
  return (
    <section className="p-3">
      <Navbar />
      {children}
    </section>
  )
}

export default LayoutDashboard;
