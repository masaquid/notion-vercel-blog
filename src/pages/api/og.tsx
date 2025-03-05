import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { SITE_NAME } from "@/config";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Default Title";
  const category = searchParams.get("category") || "Uncategorized";
  const siteName = ""; 

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          color: "#333",
          fontFamily: '"LINESeed", Arial, sans-serif',
        }}
      >
        <div
          style={{
            width: "100%",
            height: "80px",
            background: "linear-gradient(135deg, #2272b6 0%, #0096c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "500",
            color: "white",
          }}
        >
          {siteName}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "0 80px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "500",
              backgroundColor: "#0096c7",
              color: "white",
              padding: "8px 16px",
              borderRadius: "10px",
              display: "flex", 
              justifyContent: "center",
              alignItems: "center",
              minWidth: "120px", 
              maxWidth: "200px",
            }}
          >
            {category}
          </div>

          <h1
            style={{
              fontSize: "56px",
              fontWeight: "700",
              margin: "20px 0 0 0", 
              textAlign: "left", 
              maxWidth: "1040px",
              lineHeight: "1.2",
              wordBreak: "break-word",
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            width: "100%",
            height: "80px",
            background: "linear-gradient(135deg, #2272b6 0%, #0096c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "500",
            color: "white",
          }}
        >
          {SITE_NAME}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
