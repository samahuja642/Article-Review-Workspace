import { Header } from "~/app/_components/Header";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
