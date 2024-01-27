import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: "34f2630b-2f0d-477f-a9ba-61503e5fccf0",
});

await pc.describeIndex("long-term-memory");
