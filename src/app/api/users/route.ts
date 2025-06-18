import { getData } from "@/lib/database";
import { User } from "@/types/type";
// import { cookies } from "next/headers";

export const GET = async () => {
    // const cookie = await cookies();
    // const token = cookie.get("Session");
    // if(token) {
    //     const { message } = getData(`Session:${token.value}`);
    //     if(message === "success") {
            const {  data: users }: { data: User[] } = getData("User");
            return new Response(JSON.stringify({ message: "success", data: users }), { status: 200 });
    //     }
    // } 

    // return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
};