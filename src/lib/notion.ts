import { Client } from "@notionhq/client";
import {
  QueryDatabaseResponse,
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID as string;

/**
 * Notionの投稿データを表す型
 */
export type NotionPost = {
  id: string;
  slug: string;
  title: string;
  publishedDate: string;
  category: string;
  tags: string[];
  summary?: string;
  content?: string;
};

/**
 * Databaseの一覧を取得し、必要なフィールドを整形して返す
 */
export async function getDatabase(): Promise<NotionPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Status",
        select: { equals: "公開" },
      },
      sorts: [{ property: "Published Date", direction: "descending" }],
    }) satisfies QueryDatabaseResponse;

    return response.results
      .filter((page): page is PageObjectResponse => "properties" in page)
      .map((page) => ({
        id: page.id,
        slug: extractSlugFromPage(page),
        title: extractTitleFromPage(page),
        publishedDate: extractPublishedDateFromPage(page),
        category: extractCategoryFromPage(page),
        tags: extractTagsFromPage(page),
        summary: extractSummaryFromPage(page),
      }));
  } catch (error) {
    console.error("getDatabase error:", error);
    return [];
  }
}

/**
 * slug から特定の記事ページを取得し、content(HTML) を含めた詳細データを返す
 */
export async function getPage(slug: string): Promise<NotionPost | null> {
  try {
    const allPosts = await getDatabase();
    const pageData = allPosts.find((p) => p.slug === slug);
    if (!pageData) return null;

    // Notion ブロックを取得し、HTMLに変換
    const content = await getHtmlFromBlocks(pageData.id);

    return { ...pageData, content };
  } catch (error) {
    console.error("getPage error:", error);
    return null;
  }
}

/**
 * 前後の記事を取得する
 */
export async function getAdjacentPosts(currentPublishedDate: string) {
  const allPosts = await getDatabase();

  const sorted = allPosts.sort((a, b) =>
    a.publishedDate > b.publishedDate ? -1 : 1
  );

  const currentIndex = sorted.findIndex(
    (p) => p.publishedDate === currentPublishedDate
  );

  const prevPost =
    currentIndex > 0
      ? { title: sorted[currentIndex - 1].title, slug: sorted[currentIndex - 1].slug }
      : null;

  const nextPost =
    currentIndex < sorted.length - 1
      ? { title: sorted[currentIndex + 1].title, slug: sorted[currentIndex + 1].slug }
      : null;

  return { prevPost, nextPost };
}

/**
 * 関連記事を取得する
 */
export async function getRelatedPosts(category: string, currentId: string): Promise<NotionPost[]> {
  const allPosts = await getDatabase();

  const filtered = allPosts.filter((p) => p.category === category && p.id !== currentId);

  const sorted = filtered.sort((a, b) =>
    a.publishedDate > b.publishedDate ? -1 : 1
  );

  return sorted.slice(0, 3);
}

/**
 * NotionブロックをHTMLに変換する
 *  - paragraph中の改行(\n)を <br> に変換
 *  - 空ブロックは空行として <p><br/></p> を表示
 *  - リンクは href プロパティで <a> タグを生成
 *  - 水平線(divider)に対応
 */
async function getHtmlFromBlocks(pageId: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId });
    const blocks = response.results.filter(
      (block): block is BlockObjectResponse => "type" in block
    );

    return blocks
      .map((block) => {
        switch (block.type) {
          case "paragraph": {
            const richText = block.paragraph?.rich_text || [];
            const html = parseRichText(richText);

            // 空の段落なら <p><br/></p>
            if (!html.trim()) {
              return `<p><br/></p>`;
            }
            return `<p>${html}</p>`;
          }

          case "heading_1": {
            const richText = block.heading_1?.rich_text || [];
            const html = parseRichText(richText);
            return `<h1>${html}</h1>`;
          }

          case "heading_2": {
            const richText = block.heading_2?.rich_text || [];
            const html = parseRichText(richText);
            return `<h2>${html}</h2>`;
          }

          case "heading_3": {
            const richText = block.heading_3?.rich_text || [];
            const html = parseRichText(richText);
            return `<h3>${html}</h3>`;
          }

          case "bulleted_list_item": {
            const richText = block.bulleted_list_item?.rich_text || [];
            const html = parseRichText(richText);
            return `<ul><li>${html}</li></ul>`;
          }

          case "numbered_list_item": {
            const richText = block.numbered_list_item?.rich_text || [];
            const html = parseRichText(richText);
            return `<ol><li>${html}</li></ol>`;
          }

          case "quote": {
            const richText = block.quote?.rich_text || [];
            const html = parseRichText(richText);
            return `<blockquote>${html}</blockquote>`;
          }

          // 水平線
          case "divider": {
            return `<hr/>`;
          }

          // 画像ブロックの処理 (既存)
          case "image": {
            const { type, caption } = block.image;
            let imageUrl = "";

            if (type === "file") {
              imageUrl = block.image.file.url;
            } else if (type === "external") {
              imageUrl = block.image.external.url;
            }

            const captionText =
              caption?.map((richText) => richText.plain_text).join("") || "";

            return `
              <figure style="max-width: 100%; margin: 1em 0;">
                <img
                  src="${imageUrl}"
                  alt="${captionText}"
                  style="
                    max-width: 800px;
                    max-height: 500px;
                    object-fit: contain;
                    display: block;
                    margin: 0 auto;
                  "
                />
                ${
                  captionText
                    ? `<figcaption style="text-align: center; font-size: 0.9em; color: #666;">${captionText}</figcaption>`
                    : ""
                }
              </figure>
            `;
          }

          // その他のブロックは未対応として空文字
          default:
            return "";
        }
      })
      .join("\n");
  } catch (error) {
    console.error("getHtmlFromBlocks error:", error);
    return "";
  }
}

/**
 * リッチテキスト配列をHTML文字列に変換
 *  - 改行(\n)は <br> に変換
 *  - href があれば <a> で囲む
 *  - annotations.bold, italic, code なども対応可能
 */
function parseRichText(richTextArray: RichTextItemResponse[]): string {
  return richTextArray
    .map((richText) => {
      const { href, plain_text, annotations } = richText;
      let textHtml = plain_text.replace(/\n/g, "<br/>");

      // 太字や斜体など
      if (annotations.bold) {
        textHtml = `<strong>${textHtml}</strong>`;
      }
      if (annotations.italic) {
        textHtml = `<em>${textHtml}</em>`;
      }
      if (annotations.code) {
        textHtml = `<code>${textHtml}</code>`;
      }

      // リンクがあるなら <a> で囲む
      if (href) {
        textHtml = `<a href="${href}" target="_blank" rel="noopener noreferrer">${textHtml}</a>`;
      }

      return textHtml;
    })
    .join("");
}

/**
 * 各プロパティを取得するヘルパー関数
 */
function extractSlugFromPage(page: PageObjectResponse): string {
  const slugProp = page.properties.Slug;
  if (slugProp?.type === "rich_text") {
    return slugProp.rich_text[0]?.plain_text.trim() || "";
  }
  return "";
}

function extractTitleFromPage(page: PageObjectResponse): string {
  const nameProp = page.properties.Name;
  const titleProp = page.properties.Title;

  if (nameProp?.type === "title") {
    return nameProp.title[0]?.plain_text.trim() || "";
  }
  if (titleProp?.type === "title") {
    return titleProp.title[0]?.plain_text.trim() || "";
  }
  return "No Title";
}

function extractPublishedDateFromPage(page: PageObjectResponse): string {
  const dateProp = page.properties["Published Date"];
  if (dateProp?.type === "date") {
    return dateProp.date?.start ?? "";
  }
  return "";
}

function extractCategoryFromPage(page: PageObjectResponse): string {
  const catProp = page.properties.Category;
  if (catProp?.type === "select") {
    return catProp.select?.name || "未分類";
  }
  return "未分類";
}

function extractTagsFromPage(page: PageObjectResponse): string[] {
  const tagsProp = page.properties.Tags;
  if (tagsProp?.type === "multi_select") {
    return tagsProp.multi_select.map((tag) => tag.name);
  }
  return [];
}

function extractSummaryFromPage(page: PageObjectResponse): string {
  const summaryProp = page.properties.Summary;
  if (summaryProp?.type === "rich_text") {
    return summaryProp.rich_text[0]?.plain_text.trim() || "";
  }
  return "";
}
