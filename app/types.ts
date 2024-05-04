// https://docs.farcaster.xyz/reference/warpcast/api
export type Channel = {
  id: string;
  url: string;
  name: string;
  description: string;
  image_url: string;
  parent_url: string;
  leadFid: number;
  hostFids: number[];
  created_at: number;
  follower_count: number;
};

// Neynar
export type UsersResponsePartial = {
  users: {
    fid: number;
    username?: string;
    verifications?: string[];
  }[];
  next: { cursor: string };
};
