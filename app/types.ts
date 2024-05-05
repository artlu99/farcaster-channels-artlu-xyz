// https://docs.farcaster.xyz/reference/warpcast/api
export type Channel = {
  id: string;
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  leadFid: number;
  hostFids: number[];
  createdAt: number;
  followerCount: number;
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
