
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/signin"); // Instantly redirects before rendering
}
