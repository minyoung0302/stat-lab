"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import styles from "@/app/page.module.css";

const recentStorageKey = "maple_lab_recent_searches";

type RankingItem = Record<string, unknown>;
type EventNotice = {
    title: string;
    url: string;
    notice_id: number;
    date: string;
    date_event_start: string;
    date_event_end: string;
};
type EventDetail = {
    title: string;
    url: string;
    contents: string;
    date: string;
    date_event_start: string;
    date_event_end: string;
};

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

function readEventNotices(data: unknown) {
    if (!data || typeof data !== "object") {
        return [];
    }

    const notices = (data as Record<string, unknown>).event_notice;

    return Array.isArray(notices) ? notices as EventNotice[] : [];
}

function formatDate(value: string) {
    if (!value) {
        return "-";
    }

    return value.slice(0, 10);
}

function sanitizeEventContents(contents: string) {
    return contents
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "");
}

export default function Home() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [rankingItems, setRankingItems] = useState<RankingItem[]>([]);
    const [rankingStatus, setRankingStatus] = useState<"loading" | "ready" | "error">("loading");
    const [events, setEvents] = useState<EventNotice[]>([]);
    const [eventStatus, setEventStatus] = useState<"loading" | "ready" | "error">("loading");
    const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
    const [eventDetailStatus, setEventDetailStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

    useEffect(() => {
        setRecentSearches(readRecentSearches());
    }, []);

    useEffect(() => {
        let ignore = false;

        const loadRanking = async () => {
            setRankingStatus("loading");

            try {
                const res = await fetch("/api/maple/ranking?type=overall&page=1", {
                    cache: "no-store",
                });
                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error("ranking request failed");
                }

                if (!ignore) {
                    setRankingItems(readRankingItems(data).slice(0, 5));
                    setRankingStatus("ready");
                }
            } catch {
                if (!ignore) {
                    setRankingItems([]);
                    setRankingStatus("error");
                }
            }
        };

        const loadEvents = async () => {
            setEventStatus("loading");

            try {
                const res = await fetch("/api/maple/notice-event", {
                    cache: "no-store",
                });
                const data = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error("event request failed");
                }

                if (!ignore) {
                    setEvents(readEventNotices(data).slice(0, 5));
                    setEventStatus("ready");
                }
            } catch {
                if (!ignore) {
                    setEvents([]);
                    setEventStatus("error");
                }
            }
        };

        void loadRanking();
        void loadEvents();

        return () => {
            ignore = true;
        };
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

    const onSelectEvent = async (event: EventNotice) => {
        setSelectedEvent(null);
        setEventDetailStatus("loading");

        try {
            const res = await fetch(`/api/maple/notice-event?notice_id=${event.notice_id}`, {
                cache: "no-store",
            });
            const data = await res.json().catch(() => null);

            if (!res.ok || !data || typeof data !== "object") {
                throw new Error("event detail request failed");
            }

            setSelectedEvent(data as EventDetail);
            setEventDetailStatus("ready");
        } catch {
            setEventDetailStatus("error");
        }
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

            <section className={styles.homeInfoGrid} aria-label="홈 정보">
                <article className={styles.infoPanel}>
                    <div className={styles.sectionHeader}>
                        <h2>종합 랭킹</h2>
                        <Link href="/ranking">전체 보기</Link>
                    </div>

                    {rankingStatus === "loading" && (
                        <p className={styles.emptyText}>종합 랭킹을 불러오는 중입니다.</p>
                    )}
                    {rankingStatus === "error" && (
                        <p className={styles.emptyText}>종합 랭킹을 불러오지 못했습니다.</p>
                    )}
                    {rankingStatus === "ready" && (
                        <ol className={styles.homeRankingList}>
                            {rankingItems.map((item, index) => {
                                const name = formatValue(item.character_name);
                                const world = formatValue(item.world_name);
                                const job = formatValue(item.class_name);
                                const level = formatValue(item.character_level);

                                return (
                                    <li key={`${name}-${index}`}>
                                        <Link href={`/${encodeURIComponent(name)}`}>
                                            <span>{formatValue(item.ranking)}</span>
                                            <strong>{name}</strong>
                                            <em>{world} · {job} · Lv.{level}</em>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </article>

                <article className={styles.infoPanel}>
                    <div className={styles.sectionHeader}>
                        <h2>진행 중 이벤트</h2>
                        {selectedEvent && (
                            <button type="button" onClick={() => {
                                setSelectedEvent(null);
                                setEventDetailStatus("idle");
                            }}>
                                목록
                            </button>
                        )}
                    </div>

                    {!selectedEvent && eventDetailStatus !== "loading" && (
                        <>
                            {eventStatus === "loading" && (
                                <p className={styles.emptyText}>이벤트를 불러오는 중입니다.</p>
                            )}
                            {eventStatus === "error" && (
                                <p className={styles.emptyText}>이벤트를 불러오지 못했습니다.</p>
                            )}
                            {eventStatus === "ready" && (
                                <div className={styles.eventList}>
                                    {events.map((event) => (
                                        <button
                                            key={event.notice_id}
                                            type="button"
                                            onClick={() => onSelectEvent(event)}
                                        >
                                            <strong>{event.title}</strong>
                                            <span>{formatDate(event.date_event_start)} ~ {formatDate(event.date_event_end)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {eventDetailStatus === "loading" && (
                        <p className={styles.emptyText}>이벤트 상세를 불러오는 중입니다.</p>
                    )}
                    {eventDetailStatus === "error" && (
                        <p className={styles.emptyText}>이벤트 상세를 불러오지 못했습니다.</p>
                    )}
                    {selectedEvent && eventDetailStatus === "ready" && (
                        <div className={styles.eventDetail}>
                            <h3>{selectedEvent.title}</h3>
                            <p>{formatDate(selectedEvent.date_event_start)} ~ {formatDate(selectedEvent.date_event_end)}</p>
                            <div
                                className={styles.eventContents}
                                dangerouslySetInnerHTML={{__html: sanitizeEventContents(selectedEvent.contents)}}
                            />
                            <a href={selectedEvent.url} target="_blank" rel="noreferrer">원문 보기</a>
                        </div>
                    )}
                </article>
            </section>
        </div>
    );
}
