"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";

const recentStorageKey = "maple_lab_recent_searches";

function readStoredName() {
    if (typeof window === "undefined") {
        return "";
    }

    return window.localStorage.getItem("ms_name") || "";
}

function readRecentSearches() {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(recentStorageKey);
        const parsed = raw ? JSON.parse(raw) : [];

        return Array.isArray(parsed)
            ? parsed.filter((value) => typeof value === "string").slice(0, 5)
            : [];
    } catch {
        return [];
    }
}

function writeSearchName(name: string) {
    const previous = readRecentSearches();
    const next = [name, ...previous.filter((item) => item !== name)].slice(0, 5);

    window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
    window.localStorage.setItem("ms_name", name);
    window.dispatchEvent(new Event("ms_name_change"));
}

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [query, setQuery] = useState("");
    const [storedName, setStoredName] = useState("");
    const [currentSearch, setCurrentSearch] = useState("");

    useEffect(() => {
        const updateStoredName = () => setStoredName(readStoredName());

        updateStoredName();
        window.addEventListener("storage", updateStoredName);
        window.addEventListener("ms_name_change", updateStoredName);

        return () => {
            window.removeEventListener("storage", updateStoredName);
            window.removeEventListener("ms_name_change", updateStoredName);
        };
    }, []);

    useEffect(() => {
        setCurrentSearch(window.location.search);
    }, [pathname]);

    const characterHref = storedName ? `/${encodeURIComponent(storedName)}` : "/?view=character";
    const isCharacterRoute = pathname !== "/" && pathname !== "/boss" && pathname !== "/ranking";
    const isCharacterSearchView = pathname === "/" && new URLSearchParams(currentSearch).get("view") === "character";

    const navItems = [
        {label: "캐릭터정보", href: characterHref, active: isCharacterRoute || isCharacterSearchView},
        {label: "보스 배율", href: "/boss", active: pathname === "/boss"},
        {label: "랭킹", href: "/ranking", active: pathname === "/ranking"},
    ];

    const onSubmit = () => {
        const name = query.trim();

        if (!name) {
            return;
        }

        writeSearchName(name);
        setStoredName(name);
        setQuery("");
        router.push(`/${encodeURIComponent(name)}`);
    };

    return (
        <header style={styles.header}>
            <div style={styles.inner}>
                <Link href="/" style={styles.logo}>
                    <span style={styles.logoMark}>ML</span>
                    <span>Maple Lab</span>
                </Link>

                <nav style={styles.nav} aria-label="주요 메뉴">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            style={{
                                ...styles.navLink,
                                ...(item.active ? styles.navLinkActive : {}),
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={styles.search}>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                onSubmit();
                            }
                        }}
                        placeholder="캐릭터 검색"
                        aria-label="캐릭터 검색"
                        style={styles.input}
                    />
                    <button type="button" onClick={onSubmit} style={styles.button}>
                        검색
                    </button>
                </div>
            </div>
        </header>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        width: "100%",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
    },
    inner: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 18,
        width: "100%",
        maxWidth: 1180,
        minHeight: 64,
        margin: "0 auto",
        padding: "0 24px",
    },
    logo: {
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        color: "#111827",
        textDecoration: "none",
        fontSize: 16,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: "nowrap",
    },
    logoMark: {
        display: "inline-grid",
        placeItems: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#111827",
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 900,
    },
    nav: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        flex: "1 1 auto",
        minWidth: 0,
    },
    navLink: {
        padding: "8px 10px",
        borderRadius: 7,
        color: "#6b7280",
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    navLinkActive: {
        background: "#eff6ff",
        color: "#1d4ed8",
    },
    search: {
        display: "grid",
        gridTemplateColumns: "minmax(120px, 1fr) auto",
        gap: 6,
        alignItems: "center",
        flex: "0 1 280px",
        marginLeft: "auto",
    },
    input: {
        minWidth: 0,
        padding: "9px 10px",
        border: "1px solid #d1d5db",
        borderRadius: 7,
        outline: "none",
        color: "#111827",
        fontSize: 14,
    },
    button: {
        padding: "9px 11px",
        border: 0,
        borderRadius: 7,
        background: "#111827",
        color: "#ffffff",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
        whiteSpace: "nowrap",
    },
};
