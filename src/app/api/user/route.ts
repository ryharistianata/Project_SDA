import redis from "@/lib/redis";
import { cookies } from "next/headers";


export const GET = async () => {
    const cookie = await cookies();
    const token = cookie.get("Session");
    const user = await redis.get(`Session:${token?.value}`);
    if(user) {
        return new Response(JSON.stringify(JSON.parse(user)), { status: 200 });
    }
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
}