import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies(); // Await if it's returning a promise
  const session = cookieStore.get("session_token"); // Now this should work

  return session ? session.value : null;
}
