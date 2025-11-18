import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();

  cookieStore.set("username", "", {
    path: "/",
    maxAge: 0,
  });

  cookieStore.set("senha", "", {
    path: "/",
    maxAge: 0,
  });

  return Response.json({ status: "cookies zerados" });
}