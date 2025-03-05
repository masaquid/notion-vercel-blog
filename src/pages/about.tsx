import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME } from "@/config";

export default function About() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Head>
        <title>筆者プロフィール | {SITE_NAME}</title>
      </Head>

      <Header />

      <main className="section" style={{ paddingTop: "100px", flexGrow: 1 }}>
        <div className="container">
          <h1 className="title is-2">筆者プロフィール</h1>
          <p className="content">
            ここに筆者のプロフィールや自己紹介を記載します。
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
