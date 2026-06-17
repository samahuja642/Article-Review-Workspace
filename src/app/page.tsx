import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { HomePage } from "./_components/HomePage";

export default async function RootPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/organization");
  }

  return <HomePage />;
}
