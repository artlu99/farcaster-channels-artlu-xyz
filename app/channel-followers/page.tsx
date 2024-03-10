"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChannelFollowers() {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0">
      <div className="z-10 w-full flex flex-col font-mono text-sm lg:flex">
        For illustration only, connected addresses for the first 100 channel
        followers are shown here as a CSV
        <br />
        <i>e.g., </i>
        <Link href={`${pathname}/higher.csv`}>{pathname}/higher.csv</Link>
        <br />
        <Link href="/">see Main Page for link to Github (MIT-licensed)</Link>
      </div>
    </main>
  );
}
