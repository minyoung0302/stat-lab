"use client";

import Link from "next/link";
import {useEffect, useMemo, useRef, useState} from "react";
import styles from "@/app/ranking/page.module.css";

type RankingType = "overall" | "union" | "guild" | "dojang" | "achievement";
type RankingItem = Record<string, unknown>;
type CharacterPreview = {
    image: string;
};

const rankingTabs: {type: RankingType; label: string; description: string}[] = [
    {type: "overall", label: "종합", description: "레벨 기준 캐릭터 랭킹"},
    {type: "union", label: "유니온", description: "유니온 레벨 기준 랭킹"},
    {type: "guild", label: "길드", description: "월드별 길드 랭킹"},
    {type: "dojang", label: "무릉도장", description: "무릉 층수와 기록 기준 랭킹"},
    {type: "achievement", label: "업적", description: "업적 점수 기준 랭킹"},
];

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "number") {
        return value.toLocaleString("ko-KR");
    }

    return String(value);
}

function readRankingItems(data: unknown) {
    if (!data || typeof data !== "object") {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const value of Object.values(record)) {
        if (Array.isArray(value)) {
            return value as RankingItem[];
        }
    }

    return [];
}

function pick(item: RankingItem, keys: string[]) {
    for (const key of keys) {
        const value = formatValue(item[key]);

        if (value !== "-") {
            return value;
        }
    }

    return "-";
}

function rankingTitle(type: RankingType, item: RankingItem) {
    if (type === "guild") {
        return pick(item, ["guild_name"]);
    }

    return pick(item, ["character_name"]);
}

function rankingMeta(type: RankingType, item: RankingItem) {
    if (type === "guild") {
        return [
            pick(item, ["world_name"]),
            `Lv.${pick(item, ["guild_level"])}`,
            `마스터 ${pick(item, ["guild_master_name"])}`,
        ].filter((value) => !value.includes("-"));
    }

    const job = [
        pick(item, ["class_name", "character_class"]),
        pick(item, ["sub_class_name"]),
    ].filter((value) => value !== "-").join(" / ");
    const guild = pick(item, ["character_guildname", "character_guild_name"]);

    return [
        pick(item, ["world_name"]),
        job,
        `Lv.${pick(item, ["character_level"])}`,
        guild === "-" ? "길드 없음" : guild,
    ].filter((value) => value !== "" && value !== "-" && !value.endsWith(".-"));
}

function rankingMainStat(type: RankingType, item: RankingItem) {
    if (type === "overall") {
        return {
            label: "인기도",
            value: pick(item, ["character_popularity"]),
        };
    }

    if (type === "union") {
        return {label: "유니온", value: pick(item, ["union_level"])};
    }

    if (type === "guild") {
        return {label: "포인트", value: pick(item, ["guild_point"])};
    }

    if (type === "dojang") {
        return {
            label: "기록",
            value: `${pick(item, ["dojang_floor"])}층 / ${pick(item, ["dojang_time_record", "dojang_time"])}초`,
        };
    }

    return {label: "업적", value: pick(item, ["trophy_score", "achievement_score"])};
}

function canShowCharacterPreview(type: RankingType) {
    return type !== "guild";
}

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function readCharacterPreview(data: unknown): CharacterPreview | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const basic = (data as Record<string, unknown>).basic;

    if (!basic || typeof basic !== "object") {
        return null;
    }

    const record = basic as Record<string, unknown>;
    const image = typeof record.character_image === "string" ? record.character_image : "";

    if (!image) {
        return null;
    }

    return {image};
}

function RankingRow({
    type,
    item,
    preview,
}: {
    type: RankingType;
    item: RankingItem;
    preview?: CharacterPreview;
}) {
    const rank = pick(item, ["ranking", "rank"]);
    const title = rankingTitle(type, item);
    const meta = rankingMeta(type, item);
    const mainStat = rankingMainStat(type, item);

    return (
        <article className={`${styles.rankingRow} ${!canShowCharacterPreview(type) ? styles.rankingRowNoImage : ""}`}>
            <span className={styles.rank}>{rank}.</span>
            {canShowCharacterPreview(type) && (
                <div className={styles.characterPreview}>
                    {preview?.image ? (
                        <img
                            src={preview.image}
                            alt={title}
                            className={styles.characterImage}
                        />
                    ) : (
                        <span>{title.slice(0, 1)}</span>
                    )}
                </div>
            )}
            <div className={styles.rankingMain}>
                {canShowCharacterPreview(type) ? (
                    <Link href={`/${encodeURIComponent(title)}`}>{title}</Link>
                ) : (
                    <strong>{title}</strong>
                )}
                <p>{meta.join(" · ")}</p>
            </div>
            <div className={styles.rankingStat}>
                <span>{mainStat.label}</span>
                <strong>{mainStat.value}</strong>
            </div>
        </article>
    );
}

export default function RankingPage() {
    const [activeType, setActiveType] = useState<RankingType>("overall");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<unknown>(null);
    const [previews, setPreviews] = useState<Record<string, CharacterPreview>>({});
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [error, setError] = useState("");
    const previewCache = useRef<Record<string, CharacterPreview>>({});

    const activeTab = useMemo(() => {
        return rankingTabs.find((tab) => tab.type === activeType) ?? rankingTabs[0];
    }, [activeType]);
    const apiPage = Math.floor((page - 1) / 10) + 1;
    const pageOffset = ((page - 1) % 10) * 20;
    const items = useMemo(() => {
        return readRankingItems(data).slice(pageOffset, pageOffset + 20);
    }, [data, pageOffset]);
    const pageNumbers = useMemo(() => {
        const start = Math.max(1, page - 2);

        return Array.from({length: 5}, (_, index) => start + index);
    }, [page]);

    useEffect(() => {
        setPage(1);
    }, [activeType]);

    useEffect(() => {
        let ignore = false;

        const loadRanking = async () => {
            setStatus("loading");
            setError("");

            try {
                const res = await fetch(`/api/maple/ranking?type=${activeType}&page=${apiPage}`, {
                    cache: "no-store",
                });
                const nextData = await res.json();

                if (!res.ok) {
                    const message = typeof nextData?.error === "string"
                        ? nextData.error
                        : nextData?.error?.message;

                    throw new Error(message ?? "랭킹 정보를 불러오지 못했습니다.");
                }

                if (!ignore) {
                    setData(nextData);
                    setStatus("ready");
                }
            } catch (fetchError) {
                if (!ignore) {
                    setData(null);
                    setStatus("error");
                    setError(fetchError instanceof Error ? fetchError.message : "랭킹 정보를 불러오지 못했습니다.");
                }
            }
        };

        void loadRanking();

        return () => {
            ignore = true;
        };
    }, [activeType, apiPage]);

    useEffect(() => {
        let ignore = false;

        if (!canShowCharacterPreview(activeType) || items.length === 0) {
            setPreviews({});
            return () => {
                ignore = true;
            };
        }

        const names = Array.from(new Set(
            items
                .map((item) => pick(item, ["character_name"]))
                .filter((name) => name !== "-"),
        ));

        const cachedPreviews = names.reduce<Record<string, CharacterPreview>>((result, name) => {
            const cached = previewCache.current[name];

            if (cached) {
                result[name] = cached;
            }

            return result;
        }, {});

        setPreviews(cachedPreviews);

        const loadPreviews = async () => {
            for (const name of names) {
                if (ignore || previewCache.current[name]) {
                    continue;
                }

                try {
                    const res = await fetch(`/api/maple/character-basic?name=${encodeURIComponent(name)}`, {
                        cache: "no-store",
                    });
                    const nextData = await res.json().catch(() => null);

                    if (res.ok) {
                        const preview = readCharacterPreview(nextData);

                        if (preview) {
                            previewCache.current[name] = preview;

                            if (!ignore) {
                                setPreviews((current) => ({
                                    ...current,
                                    [name]: preview,
                                }));
                            }
                        }
                    }
                } catch {
                    // Preview images are optional; the ranking row still renders without them.
                }

                await wait(240);
            }
        };

        void loadPreviews();

        return () => {
            ignore = true;
        };
    }, [activeType, items]);

    return (
        <main className={styles.page}>
            <section className={styles.rankingPanel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span>Ranking</span>
                        <h1>랭킹 정보</h1>
                        <p>{activeTab.description}</p>
                    </div>
                </div>

                <div className={styles.tabList}>
                    {rankingTabs.map((tab) => (
                        <button
                            key={tab.type}
                            type="button"
                            className={activeType === tab.type ? styles.tabActive : ""}
                            onClick={() => setActiveType(tab.type)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {status === "loading" && (
                    <p className={styles.message}>랭킹 정보를 불러오는 중입니다.</p>
                )}

                {status === "error" && (
                    <p className={styles.error}>{error}</p>
                )}

                {status === "ready" && items.length === 0 && (
                    <p className={styles.message}>표시할 랭킹 정보가 없습니다.</p>
                )}

                {status === "ready" && items.length > 0 && (
                    <div className={styles.rankingList}>
                        {items.map((item, index) => (
                            <RankingRow
                                key={`${activeType}-${index}`}
                                type={activeType}
                                item={item}
                                preview={previews[pick(item, ["character_name"])]}
                            />
                        ))}
                    </div>
                )}

                {status === "ready" && (
                    <div className={styles.pagination} aria-label="랭킹 페이지">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                        >
                            이전
                        </button>
                        {pageNumbers.map((pageNumber) => (
                            <button
                                key={pageNumber}
                                type="button"
                                className={page === pageNumber ? styles.pageActive : ""}
                                onClick={() => setPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                        >
                            다음
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
