"use client";

import { useEffect, useState } from "react";

export const runtime = "edge";

type UsersResponse = {
  users: {
    fid: number;
    username?: string;
    verifications?: string[];
  }[];
  next: { cursor: string };
};

const api_key = process.env.NEXT_PUBLIC_NEENOO_API_KEY || "no API key";

export default function FollowersCSV({ params }: { params: { slug: string } }) {
  const [results, setResults] = useState<UsersResponse | undefined>(undefined);

  const slug = params.slug;
  const [channelId] = slug.split(".");

  useEffect(() => {
    async function fetchAsync() {
      const newResults = await fetch(
        `https://api.neynar.com/v2/farcaster/channel/followers?id=${channelId}&limit=100`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            api_key: api_key,
          },
        }
      );
      try {
        const newResultsJson = await newResults.json();
        setResults(newResultsJson as UsersResponse);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAsync();
  }, [channelId]);

  const csv = results?.users
    ? results.users.map((r, i) => {
        const { fid, username, verifications } = r;
        return verifications && verifications.length > 0
          ? `${i},${channelId},${fid},${username},${verifications[0]}\n`
          : undefined;
      })
    : "there was a problem, results not available";

  return (
    <div>
      <pre>{csv}</pre>
    </div>
  );
}
