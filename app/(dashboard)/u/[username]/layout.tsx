import { redirect } from "next/navigation";

import { getSelf } from "@/lib/auth-service";

import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { Container } from "./_components/container";

interface CreatorLayoutProps {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
};

const CreatorLayout = async ({
  params,
  children,
}: CreatorLayoutProps) => {
  const { username } = await params;
  let self;

  try {
    self = await getSelf();
  } catch {
    redirect("/");
  }

  if (username !== self.username) {
    redirect(`/u/${self.username}`);
  }

  return ( 
    <>
      <Navbar />
      <div className="flex h-full pt-20">
        <Sidebar />
        <Container>
          {children}
        </Container>
      </div>
    </>
  );
}
 
export default CreatorLayout;
