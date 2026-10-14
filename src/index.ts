#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import z from "zod";

import { readDiary, writeDiaryEntry } from "./diary.ts";
import { readWikiIndex, readWikiArticle, writeWikiArticle } from "./wiki.ts";

const server = new McpServer({
  name: "memory",
  version: "0.1.0",
});

server.registerTool(
  "read_diary",
  {
    description: "Read the latest diary entries.",
  },
  async () => {
    let result: string;
    let isError = false;

    try {
      result = await readDiary();
    } catch (err) {
      isError = true;
      if (err instanceof Error) {
        result = err.message;
      } else {
        result = "Unknown error occurred while reading the diary.";
      }
    }

    return { isError, content: [{ type: "text", text: result }] };
  },
);

server.registerTool(
  "write_diary_entry",
  {
    description: "Write a new diary entry.",
    inputSchema: z.object({
      title: z.string().describe("Entry's title."),
      content: z.string().describe("Entry's content."),
    }),
  },
  async ({ title, content }) => {
    let result: string;
    let isError = false;

    try {
      result = await writeDiaryEntry({ title, content });
    } catch (err) {
      isError = true;
      if (err instanceof Error) {
        result = err.message;
      } else {
        result = "Unknown error occurred writing to the diary.";
      }
    }

    return { isError, content: [{ type: "text", text: result }] };
  },
);

server.registerTool(
  "read_wiki_index",
  {
    description: "Read the index page of the Wiki.",
  },
  async () => {
    let result: string;
    let isError = false;

    try {
      result = await readWikiIndex();
    } catch (err) {
      isError = true;
      if (err instanceof Error) {
        result = err.message;
      } else {
        result = "Unknown error occurred while reading the wiki's index.";
      }
    }

    return { isError, content: [{ type: "text", text: result }] };
  },
);

server.registerTool(
  "read_wiki_article",
  {
    description: "Read a wiki article.",
    inputSchema: z.object({
      fileName: z.string().describe("Article's file name."),
    }),
  },
  async ({ fileName }) => {
    let result: string;
    let isError = false;

    try {
      result = await readWikiArticle({ fileName });
    } catch (err) {
      isError = true;
      if (err instanceof Error) {
        result = err.message;
      } else {
        result = "Unknown error occurred while reading the article.";
      }
    }

    return { isError, content: [{ type: "text", text: result }] };
  },
);

server.registerTool(
  "write_wiki_article",
  {
    description: "Write or edit a wiki article.",
    inputSchema: z.object({
      fileName: z.string().describe("Article's file name."),
      articleContent: z.string().describe("Article's content."),
      historyMessage: z
        .string()
        .describe("The changelog message for the applied edit."),
      articleName: z
        .string()
        .describe(
          "Article's own name. Mandatory when creating a new article, optional for edits.",
        )
        .optional(),
      articleDescription: z
        .string()
        .describe(
          "Article's short description. The maximum length is 100 words. Mandatory when creating a new article, optional for edits.",
        )
        .optional(),
    }),
  },
  async ({
    fileName,
    articleContent,
    historyMessage,
    articleName,
    articleDescription,
  }) => {
    let result: string;
    let isError = false;

    try {
      result = await writeWikiArticle({
        fileName,
        articleContent,
        historyMessage,
        articleName,
        articleDescription,
      });
    } catch (err) {
      isError = true;
      if (err instanceof Error) {
        result = err.message;
      } else {
        result = "Unknown error occurred while writing the article.";
      }
    }

    return { isError, content: [{ type: "text", text: result }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memory MCP Server running on stdio");
}

let shuttingDown = false;
async function gracefulShutdown(reason: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.error(`Shutting down Memory MCP server: ${reason}`);

  try {
    await server.close();
  } finally {
    process.exit(0);
  }
}

process.stdin.on("end", () => gracefulShutdown("stdin stream ended (EOF)"));
process.stdin.on("close", () => gracefulShutdown("stdin channel closed"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM received"));
process.on("SIGINT", () => gracefulShutdown("SIGINT received"));

main().catch(async (error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
