import Link from "next/link";
import { SITE_NAME } from "@/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons"; 

export default function Header() {
  return (
    <header
      className="navbar is-fixed-top has-shadow"
      style={{
        background: "linear-gradient(135deg, #2272b6 0%, #0096c7 100%)",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <div className="container is-flex is-justify-content-space-between is-align-items-center">
        <h1 className="title is-4 has-text-white" style={{ margin: "0" }}>
          <Link href="/" className="has-text-white">
            {SITE_NAME}
          </Link>
        </h1>

        <nav>
          <ul className="is-flex">
            <li className="mr-4">
              <Link href="/" className="has-text-white">
                <FontAwesomeIcon icon={faHome} size="lg" />
              </Link>
            </li>
            <li className="mr-4">
              <Link href="/about" className="has-text-white">筆者プロフィール</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
