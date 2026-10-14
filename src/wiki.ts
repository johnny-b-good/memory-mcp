export const readWikiIndex = async (): Promise<string> => "Hello world";

export const readWikiArticle = async ({}: {
  fileName: string;
}): Promise<string> => "Hello world";

export const writeWikiArticle = async ({}: {
  fileName: string;
  articleContent: string;
  historyMessage: string;
  articleName?: string;
  articleDescription?: string;
}): Promise<string> => "Hello world";
