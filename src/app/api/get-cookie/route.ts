import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const username = cookieStore.get("username")?.value;
  const senha = cookieStore.get("senha")?.value;

  return Response.json({ username, senha });
}