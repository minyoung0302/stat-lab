// 지금 안씀, 임시 Sub Navigation
"use client";

import Link from "next/link";
import {useSyncExternalStore} from "react";
import { usePathname } from "next/navigation";

function subscribe(callback: () => void) {
    // 다른 탭/창에서 localStorage 변경될 때
    const onStorage = () => callback();
    window.addEventListener("storage", onStorage);

    // 같은 탭에서 변경 감지용 커스텀 이벤트
    const onLocal = () => callback();
    window.addEventListener("ms_name_change", onLocal as EventListener);

    return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("ms_name_change", onLocal as EventListener);
    };
}

function getSnapshot() {
    return localStorage.getItem("ms_name") || "";
}

function getServerSnapshot() {
    return "";
}

export default function SubNav() {
    const pathname = usePathname();

    const name = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const safeHref = (href: string) => (name ? href : "/");

    const items = [
        { label: "분석", href: safeHref(`/${encodeURIComponent(name)}`) },
        { label: "유니온", href: safeHref(`/union?name=${encodeURIComponent(name)}`) },
        { label: "추천", href: safeHref(`/recommend?name=${encodeURIComponent(name)}`) },
    ];

    return (
        <div style={styles.wrap}>
            <div style={styles.container}>
                {items.map((it) => {
                    const active = pathname === it.href || (it.label === "분석" && pathname.startsWith("/") && pathname.split("/").filter(Boolean).length === 1);
                    return (
                        <Link
                            key={it.label}
                            href={it.href}
                            style={{ ...styles.link, ...(active ? styles.active : {}) }}
                        >
                            {it.label}
                        </Link>
                    );
                })}

                {!name && (
                    <span style={styles.hint}>캐릭터를 먼저 검색해 주세요</span>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrap: {
        position: "fixed",
        top: 60, // Header가 60px이라 그 아래
        left: 0,
        width: "100%",
        height: 44,
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        zIndex: 999,
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
        gap: 12,
    },
    link: {
        textDecoration: "none",
        color: "#111827",
        padding: "6px 12px",
        borderRadius: 10,
        border: "1px solid transparent",
        fontSize: 14,
    },
    active: {
        border: "1px solid #111827",
        fontWeight: 700,
    },
    hint: {
        marginLeft: "auto",
        fontSize: 12,
        color: "#6b7280",
    },
};