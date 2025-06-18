import { Check, CircleAlert, CircleX, TriangleAlert } from "lucide-react";

const Alert = ({
    children,
    header,
    icon
}: Readonly<{children: React.ReactNode, header: string, icon?: "error" | "info" | "warning" | "success"}>) => {
    const setIcon = (icon: "error" | "info" | "warning" | "success" = "info") => {
        switch (icon) {
            case "error":
                return  <CircleX />;
            case "info":
                return <CircleAlert />;
            case "warning":
                return <TriangleAlert />;
            case "success":
                return <Check />;
            default:
                return <CircleAlert />;
        }
    }

  return (
    <section className="bg-blue-300/50 text-slate-900 border-l-5 shadow rounded-md p-4 border border-blue-600">
      <h1 className="poppins-semibold mb-2 flex items-center gap-2">{setIcon(icon)} {header}</h1>
      {children}
    </section>
  )
}

export default Alert
