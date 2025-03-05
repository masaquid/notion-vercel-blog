import { Client } from "@notionhq/client";
import {
  QueryDatabaseResponse,
  PageObjectResponse,
  BlockObjectResponse,
  // TitlePropertyValue,
  // RichTextPropertyValue,
  // SelectPropertyValue,
  // MultiSelectPropertyValue,
  // DatePropertyValue,
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
      ? {
          title: sorted[currentIndex - 1].title,
          slug: sorted[currentIndex - 1].slug,
        }
      : null;

  const nextPost =
    currentIndex < sorted.length - 1
      ? {
          title: sorted[currentIndex + 1].title,
          slug: sorted[currentIndex + 1].slug,
        }
      : null;

  return { prevPost, nextPost };
}

/**
 * 関連記事を取得する
 */
export async function getRelatedPosts(
  category: string,
  currentId: string
): Promise<NotionPost[]> {
  const allPosts = await getDatabase();

  const filtered = allPosts.filter(
    (p) => p.category === category && p.id !== currentId
  );

  const sorted = filtered.sort((a, b) =>
    a.publishedDate > b.publishedDate ? -1 : 1
  );

  return sorted.slice(0, 3);
}

/**
 * NotionブロックをHTMLに変換する
 */
async function getHtmlFromBlocks(pageId: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({ block_id: pageId });

    // ✅ BlockObjectResponse 型のデータだけをフィルタリング
    const blocks = response.results.filter(
      (block): block is BlockObjectResponse => "type" in block
    );

    return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return `<p>${extractTextFromBlock(block.paragraph?.rich_text)}</p>`;
        case "heading_1":
          return `<h1>${extractTextFromBlock(block.heading_1?.rich_text)}</h1>`;
        case "heading_2":
          return `<h2>${extractTextFromBlock(block.heading_2?.rich_text)}</h2>`;
        case "heading_3":
          return `<h3>${extractTextFromBlock(block.heading_3?.rich_text)}</h3>`;
        case "bulleted_list_item":
          return `<ul><li>${extractTextFromBlock(
            block.bulleted_list_item?.rich_text
          )}</li></ul>`;
        case "numbered_list_item":
          return `<ol><li>${extractTextFromBlock(
            block.numbered_list_item?.rich_text
          )}</li></ol>`;
        case "quote":
          return `<blockquote>${extractTextFromBlock(block.quote?.rich_text)}</blockquote>`;
  
        // 画像ブロックの処理
        case "image": {
          const { type, caption } = block.image;
  
          // file.url または external.url から実際の画像URLを取得
          let imageUrl = "";
          if (type === "file") {
            imageUrl = block.image.file.url;
          } else if (type === "external") {
            imageUrl = block.image.external.url;
          }
  
          // キャプションがあればテキストを連結
          const captionText =
            caption?.map((richText) => richText.plain_text).join("") || "";
  
          // figure, figcaption を使った例
          return `
          <figure class="notion-figure">
            <img
              src="${imageUrl}"
              alt="${captionText}"
              class="notion-image"
            />
            ${
              captionText
                ? `<figcaption class="notion-figcaption">${captionText}</figcaption>`
                : ""
            }
          </figure>
        `;
        }
  
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
 * リッチテキスト配列から plain_text を結合
 */
function extractTextFromBlock(richTextArray?: { plain_text: string }[]): string {
  return richTextArray?.map((text) => text.plain_text).join(" ") || "";
}

/**
 * 以下、各プロパティを「Notion上での型」に合わせて取得
 * - Slug はリッチテキスト型
 * - Name / Title はタイトル型 or リッチテキスト型
 * - Published Date は日付型
 * - Category はセレクト型
 * - Tags はマルチセレクト型
 * - Summary はリッチテキスト型
 */
function extractSlugFromPage(page: PageObjectResponse): string {
  const slugProp = page.properties.Slug;
  if (slugProp?.type === "rich_text") {
    return slugProp.rich_text[0]?.plain_text.trim() || "";
  }
  return "";
}

function extractTitleFromPage(page: PageObjectResponse): string {
  // 例: Name or Title どちらかが Title型と仮定
  const nameProp = page.properties.Name;
  const titleProp = page.properties.Title;

  // Name プロパティがタイトル型の場合
  if (nameProp?.type === "title") {
    return nameProp.title[0]?.plain_text.trim() || "";
  }
  // Title プロパティがタイトル型の場合
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
