import { SITE_NAME } from "@/config";

export default function Footer() {
  return (
    <footer
      className="footer"
      style={{
        background: "linear-gradient(135deg, #2272b6 0%, #0096c7 100%)",
        width: "100vw", // ✅ ビューポート全体の幅を確保
        margin: "0",
        padding: "16px 0",
        color: "white",
        textAlign: "center",
        position: "fixed", // ✅ フッターを固定
        bottom: "0",
        left: "0", // ✅ 左端を確実に固定
        boxSizing: "border-box", // ✅ `padding` の影響を排除
      }}
    >
      <p>&copy; {new Date().getFullYear()} {SITE_NAME}</p>
    </footer>
  );
}
