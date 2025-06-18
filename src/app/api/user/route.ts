import { getData } from "@/lib/database";
import { User } from "@/types/type";
import { cookies } from "next/headers";


export const GET = async () => {
    const token = await cookies();
    const session = token.get("Session");
    
    if(session) {   
        const { data: user, message }: { data: User, message: string } = getData(`Session:${session.value}`);
        if(message === "success") { 
            return new Response(JSON.stringify({ message: "success", data: user }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ message: "Data not found", data: [] }), { status: 404 });
        }
    } else {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }   
   
}