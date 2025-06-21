import { getData } from "@/lib/database";


export const GET = async (req: Request, {
    params
}: { params: Promise<{ winner: string }> }) => {
    const { winner } = await params;
    const { message, data } = getData(`Pemenang:${winner}`);
    if(message === "success") {
        return new Response(JSON.stringify({ message: "success", data }), { 
            status: 200
        })
    } else {
        return new Response(JSON.stringify({ message: "Unauthorized", data: [] }), {
            status: 404
        })
    }
}
