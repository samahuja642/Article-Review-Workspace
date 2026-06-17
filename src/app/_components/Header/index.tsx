import { auth } from "~/server/auth";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const session = await auth();
  const user = session?.user ?? null;

  return (
    <HeaderClient
      userName={user?.name ?? null}
      userImage={user?.image ?? null}
      isLoggedIn={!!user}
    />
  );
}
