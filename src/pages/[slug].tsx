/**
 * pages/[slug].tsx
 * 個別記事ページ (SSG) でNotionのデータを取得し表示
 */
import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import { SITE_NAME } from "@/config";
import { getPage, getDatabase, getAdjacentPosts, getRelatedPosts } from "@/lib/notion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faFolder, faTag } from "@fortawesome/free-solid-svg-icons";

// 記事の詳細ページで扱うデータ型
type PageProps = {
  title: string;
  content: string;
  publishedDate: string;
  category: string;
  tags: string[];
  prevPost?: { title: string; slug: string } | null;
  nextPost?: { title: string; slug: string } | null;
  relatedPosts: { id: string; title: string; slug: string; publishedDate: string }[];
};

export default function Post({
  title,
  content,
  publishedDate,
  category,
  tags = [],
  prevPost,
  nextPost,
  relatedPosts,
}: PageProps) {
  return (
    <div className="container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Head>
        <title>{`${title} | ${SITE_NAME}`}</title>
      </Head>

      <Header />

      <main className="section" style={{ paddingTop: "100px", paddingBottom: "100px", minHeight: "calc(100vh - 80px)" }}>
        <div className="container">
          <h1 className="title">{title}</h1>

          <p className="subtitle has-text-grey" style={{ marginTop: "16px" }}>
            <FontAwesomeIcon icon={faCalendarAlt} /> {publishedDate}
          </p>

          <p className="has-text-grey">
            <FontAwesomeIcon icon={faFolder} className="icon has-text-warning" />
            <span style={{ marginLeft: "5px", fontWeight: "bold" }}>{category}</span>
          </p>

          {tags.length > 0 && (
            <div className="tags-container">
              <FontAwesomeIcon icon={faTag} className="icon" />
              {tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="content" style={{ marginTop: "40px", marginBottom: "60px" }} dangerouslySetInnerHTML={{ __html: content }} />

          <hr style={{ border: "none", borderTop: "2px dotted #ddd", marginBottom: "40px" }} />

          <div className="navigation mt-6" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            {prevPost && (
              <a href={`/${prevPost.slug}`} className="button is-light is-fullwidth">
                <span style={{ marginRight: "10px", fontSize: "18px" }}>←</span> {prevPost.title}
              </a>
            )}
            {nextPost && (
              <a href={`/${nextPost.slug}`} className="button is-light is-fullwidth">
                {nextPost.title} <span style={{ marginLeft: "10px", fontSize: "18px" }}>→</span>
              </a>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "2px dotted #ddd", margin: "60px 0" }} />

          {relatedPosts.length > 0 && (
            <div>
              <h2 className="title is-4 mt-6">関連記事</h2>
              <div className="columns">
                {relatedPosts.map((post) => (
                  <div key={post.id} className="column is-one-third">
                    <div className="card">
                      <div className="card-content">
                        <h3 className="title is-5">{post.title}</h3>
                        <p className="subtitle is-6" style={{ margin: "10px 0" }}>{post.publishedDate}</p>
                        <a href={`/${post.slug}`} className="button is-info">記事を読む →</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const rawData = await getDatabase();

  const paths = rawData.map((post) =>
    ({
      params: { slug: post.slug },
    }) satisfies { params: { slug: string } }
  );

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const page = await getPage(slug);

  if (!page) {
    return { notFound: true };
  }

  const { prevPost, nextPost } = await getAdjacentPosts(page.publishedDate);
  const relatedPosts = await getRelatedPosts(page.category ?? "未分類", page.id);

  return {
    props: {
      title: page.title,
      content: page.content,
      publishedDate: page.publishedDate,
      category: page.category,
      tags: page.tags ?? [],
      prevPost,
      nextPost,
      relatedPosts,
    } satisfies PageProps,
    revalidate: 60,
  };
};
