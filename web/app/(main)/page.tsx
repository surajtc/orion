import { auth } from "../(auth)/auth";
import { headers } from "next/headers";
import { QueryForm } from "@/components/query-form";
import ContentNodeList from "@/components/content-node-list";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="max-w-4xl w-full mx-auto mt-10 flex flex-col items-center gap-4 h-full pt-[24vh]">
      {session ? (
        <div className="text-2xl">
          Good morning, {session.user.name.split(" ")[0]}
        </div>
      ) : (
        <div className="text-2xl">What do you want to know?</div>
      )}
      <div className="w-full max-w-xl">
        <QueryForm />
        <div className="py-4" />
        <ContentNodeList />
      </div>
    </div>
  );
}
