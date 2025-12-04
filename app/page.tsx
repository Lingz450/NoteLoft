import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to demo workspace
  redirect("/workspace/demo");
}
