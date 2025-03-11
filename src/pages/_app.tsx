import Head from "next/head";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { SITE_NAME, SITE_DESCRIPTION } from "@/config";

config.autoAddCss = false;

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{SITE_NAME}｜{SITE_DESCRIPTION}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Notion をデータソースに、独自ドメインで無料運営できるブログです。"
        />
        <meta
          name="keywords"
          content="Notion, Next.js, Vercel, ブログ, ヘッドレスCMS"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

