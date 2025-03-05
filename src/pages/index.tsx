/**
 * pages/index.tsx
 * トップページ (SSR) でNotionのデータを取得し、ページネーションして表示
 */
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION, PAGE_SIZE } from "@/config";
import { getDatabase } from "@/lib/notion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faFolder, faTag } from "@fortawesome/free-solid-svg-icons";

// ページで扱う記事データ型
type PageData = {
  id: string;
  title: string;
  publishedDate: string;
  category: string;
  tags: string[];
  summary: string;
  url: string;
};

type HomeProps = {
  items: PageData[];
  totalPages: number;
  currentPage: number;
};


export default function Home({ items, totalPages, currentPage }: HomeProps) {
  return (
    <div className="container">
      <Head>
        <title>{SITE_NAME}</title>
      </Head>

      <Header />

      <section
        className="section mt-6"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 80px)",
          paddingBottom: "100px",
        }}
      >
        <div
          className="container"
          style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <h1 className="title is-2 has-text-left">📖 {SITE_NAME}</h1>
          <p className="has-text-left has-text-grey" style={{ whiteSpace: "pre-wrap" }}>
            {SITE_DESCRIPTION}
          </p>

          <div className="columns is-multiline is-variable is-6 mt-6">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="column is-one-third">
                  <div className="card">
                    <div className="card-content has-text-left">
                      <h2 className="title is-5 has-text-weight-semibold">
                        {item.title}
                      </h2>

                      <div className="icon-text">
                        <FontAwesomeIcon icon={faCalendarAlt} className="icon has-text-grey" />
                        <span>{item.publishedDate}</span>
                      </div>

                      <div className="icon-text">
                        <FontAwesomeIcon icon={faFolder} className="icon has-text-warning" />
                        <span>{item.category}</span>
                      </div>

                      <div className="icon-text">
                        <FontAwesomeIcon icon={faTag} className="icon has-text-info" />
                        <div className="tags">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="tag is-light is-info">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {item.summary && (
                        <p className="mt-4 has-text-grey">{item.summary}</p>
                      )}

                      {/* 内部リンクは <Link> で */}
                      <Link href={item.url} className="button is-light is-info is-fullwidth mt-3">
                        記事を読む →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="has-text-left">📝 記事がありません。</p>
            )}
          </div>

          <nav className="pagination is-centered mt-5" role="navigation">
            {/* 前のページ */}
            {currentPage > 1 && (
              <Link href={`/?page=${currentPage - 1}`} className="pagination-previous">
                ← 前のページ
              </Link>
            )}

            {/* 次のページ */}
            {currentPage < totalPages && (
              <Link href={`/?page=${currentPage + 1}`} className="pagination-next">
                次のページ →
              </Link>
            )}

            <ul className="pagination-list">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i}>
                  <Link
                    href={`/?page=${i + 1}`}
                    className={`pagination-link ${currentPage === i + 1 ? "is-current" : ""}`}
                  >
                    {i + 1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/**
 * サーバーサイドでNotionデータを取得 & ページネーション処理
 */
export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ query }) => {
  const rawData = await getDatabase();
  
  const today = new Date().toISOString().split("T")[0];

  const publishedData = rawData
    .filter((item) => item.publishedDate && item.publishedDate <= today)
    .sort((a, b) => (a.publishedDate > b.publishedDate ? -1 : 1));

  const pageSize = PAGE_SIZE;
  const currentPage = query.page ? parseInt(query.page as string, 10) : 1;
  const totalItems = publishedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const sliced = publishedData.slice(startIndex, endIndex);

  // 表示用データを整形
  const items = sliced.map((item) =>
    ({
      id: item.id,
      title: item.title || "無題",
      category: item.category || "未分類",
      tags: item.tags || [],
      summary: item.summary || "",
      url: `/${item.slug}`, // slugから個別ページへのパス
      publishedDate: item.publishedDate || "",
    }) satisfies PageData
  );

  return {
    props: {
      items,
      totalPages,
      currentPage,
    },
  };
};
