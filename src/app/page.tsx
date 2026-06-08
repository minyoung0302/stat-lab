"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import styles from "@/app/page.module.css";

const recentStorageKey = "maple_lab_recent_searches";

const quickLinks = [
    {label: "캐릭터정보", href: "/?view=character", mark: "CH"},
    {label: "보스 배율", href: "/boss", mark: "BS"},
    {label: "랭킹", href: "/ranking", mark: "RK"},
];

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

function writeRecentSearches(name: string) {
    const previous = readRecentSearches();
    const next = [name, ...previous.filter((item) => item !== name)].slice(0, 5);
    window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
    window.localStorage.setItem("ms_name", name);
    window.dispatchEvent(new Event("ms_name_change"));
}

export default function Home() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        setRecentSearches(readRecentSearches());
    }, []);

    const onSubmit = () => {
        const name = query.trim();

        if (!name) {
            setError("캐릭터 닉네임을 입력해 주세요.");
            return;
        }

        setError("");
        writeRecentSearches(name);
        setRecentSearches(readRecentSearches());
        router.push(`/${encodeURIComponent(name)}`);
    };

    return (
        <div className={styles.home}>
            <section className={styles.searchPanel}>
                <div className={styles.brandMark}>ML</div>
                <h1>캐릭터 분석을 시작하세요</h1>
                <p>캐릭터정보를 검색하고 보스 배율, 랭킹 화면으로 확장합니다.</p>

                <div className={styles.searchBox}>
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                onSubmit();
                            }
                        }}
                        placeholder="캐릭터 닉네임을 입력하세요"
                        aria-label="캐릭터 닉네임"
                    />
                    <button type="button" onClick={onSubmit}>
                        분석하기
                    </button>
                </div>

                {error && <p className={styles.errorText}>{error}</p>}
            </section>

            <section className={styles.quickGrid} aria-label="주요 기능">
                {quickLinks.map((item) => (
                    <Link key={item.label} href={item.href} className={styles.quickItem}>
                        <span>{item.mark}</span>
                        <strong>{item.label}</strong>
                    </Link>
                ))}
            </section>

            <section className={styles.recentSection}>
                <div className={styles.sectionHeader}>
                    <h2>최근 검색</h2>
                    <span>Nexon Open API 기반 실시간 조회</span>
                </div>

                {recentSearches.length > 0 ? (
                    <div className={styles.recentList}>
                        {recentSearches.map((name) => (
                            <Link
                                key={name}
                                href={`/${encodeURIComponent(name)}`}
                                className={styles.recentItem}
                                onClick={() => writeRecentSearches(name)}
                            >
                                {name}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyText}>검색한 캐릭터가 여기에 표시됩니다.</p>
                )}
            </section>
        </div>
    );
}
