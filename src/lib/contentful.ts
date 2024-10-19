import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN ?? "",
});

export default client;

export interface BlogPost {
  title: string;
  slug: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}