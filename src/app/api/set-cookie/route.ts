import { cookies } from "next/headers";

export async function POST(request: Request) {
    const body = await request.json();
    const { username, senha } = body;

    cookies().set("username", username, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60,
    });
    cookies().set("senha", senha, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60,
    });

    return Response.json({ status: "ok" });
}