"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function Header() {
    const router = useRouter();
    const [q, setQ] = useState(() => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("ms_name") || "";
    });

    const goSearch = () => {
        const name = q.trim();
        if(!name) return;
        localStorage.setItem("ms_name", name);
        router.push(`/${name}`);
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div style={styles.left}>
                    <Link href="/" style={styles.logo}>
                        Maple Lab
                    </Link>
                    <nav style={styles.nav}>
                        <Link
                            href={q ? `/${encodeURIComponent(q)}` : "/analysis"}
                            style={styles.link}
                        >
                            분석
                        </Link>

                        <Link
                            href={q ? `/union?name=${encodeURIComponent(q)}` : "/union"}
                            style={styles.link}
                        >
                            유니온
                        </Link>

                        <Link
                            href={q ? `/recommend?name=${encodeURIComponent(q)}` : "/recommend"}
                            style={styles.link}
                        >
                            추천
                        </Link>
                    </nav>
                </div>

                <div style={styles.search}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goSearch()}
                        placeholder="닉네임 검색"
                        style={styles.input}
                    />
                    <button onClick={goSearch} style={styles.btn}>
                        검색
                    </button>
                </div>
            </div>
        </header>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 60,
        background: "#111827",
        color: "white",
        borderBottom: "1px solid #1f2937",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
    },
    container: {
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    left: { display: "flex", alignItems: "center", gap: 24, minWidth: 0 },
    logo: { color: "white", textDecoration: "none", fontWeight: 800, fontSize: 18, whiteSpace: "nowrap" },
    nav: { display: "flex", gap: 16, alignItems: "center" },
    link: { color: "white", textDecoration: "none", opacity: 0.9 },

    search: { display: "flex", gap: 8, alignItems: "center" },
    input: {
        width: 200,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #374151",
        outline: "none",
        fontSize: 14,
        background: "#111827",
        color: "white",
    },
    btn: {
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #374151",
        background: "white",
        cursor: "pointer",
        fontSize: 14,
    },
};
