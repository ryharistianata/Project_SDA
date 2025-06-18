import Navbar from "@/components/ui/navbar"
import "./globals.css";

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
