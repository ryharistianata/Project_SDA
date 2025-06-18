import { getData } from "@/lib/database";
import { cookies } from "next/headers";


export const GET = async (req: Request, {
    params
}: { params: Promise<{ round: string }> }) => {
    const cookie = await cookies();
    const token = cookie.get("Session");
    if(token) {
        const { message: session } = getData(`Session:${token.value}`);
        if(session) {
            const { round } = await params;
            const { data: ronde, message } = getData(`Ronde:${round}`);
            if(message === "success") {
                return new Response(JSON.stringify({ message: "success", data: ronde }), { status: 200 });
            } else {
                return new Response(JSON.stringify({ message: "Data not found", data: [] }), { status: 404 });
            }
        }
    } 

    return new Response(JSON.stringify({ message: "Unauthorized", data: [] }), { status: 401 });
}