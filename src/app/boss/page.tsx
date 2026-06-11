"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import styles from "@/app/boss/page.module.css";
import characterStyles from "@/components/CharacterInfo.module.css";

type BossCategory = "weekly" | "endgame" | "monthly";

type BossEntry = {
    id: string;
    name: string;
    difficulty: string;
    category: BossCategory;
};

type BossFilter = {
    minRate: number | null;
    names: string[];
    difficulties: string[];
};

type CharacterData = Record<string, any>;

const recentStorageKey = "maple_lab_recent_searches";

const bosses: BossEntry[] = [
    {id: "swoo_normal", name: "스우", difficulty: "노멀", category: "weekly"},
    {id: "swoo_hard", name: "스우", difficulty: "하드", category: "weekly"},
    {id: "swoo_extreme", name: "스우", difficulty: "익스트림", category: "endgame"},
    {id: "damien_normal", name: "데미안", difficulty: "노멀", category: "weekly"},
    {id: "damien_hard", name: "데미안", difficulty: "하드", category: "weekly"},
    {id: "guardian_angel_slime_normal", name: "가디언 엔젤 슬라임", difficulty: "노멀", category: "weekly"},
    {id: "guardian_angel_slime_chaos", name: "가디언 엔젤 슬라임", difficulty: "카오스", category: "weekly"},
    {id: "lucid_easy", name: "루시드", difficulty: "이지", category: "weekly"},
    {id: "lucid_normal", name: "루시드", difficulty: "노멀", category: "weekly"},
    {id: "lucid_hard", name: "루시드", difficulty: "하드", category: "weekly"},
    {id: "will_easy", name: "윌", difficulty: "이지", category: "weekly"},
    {id: "will_normal", name: "윌", difficulty: "노멀", category: "weekly"},
    {id: "will_hard", name: "윌", difficulty: "하드", category: "weekly"},
    {id: "gloom_normal", name: "더스크", difficulty: "노멀", category: "weekly"},
    {id: "gloom_chaos", name: "더스크", difficulty: "카오스", category: "weekly"},
    {id: "darknell_normal", name: "듄켈", difficulty: "노멀", category: "weekly"},
    {id: "darknell_hard", name: "듄켈", difficulty: "하드", category: "weekly"},
    {id: "verus_hilla_normal", name: "진 힐라", difficulty: "노멀", category: "weekly"},
    {id: "verus_hilla_hard", name: "진 힐라", difficulty: "하드", category: "weekly"},
    {id: "black_mage_hard", name: "검은 마법사", difficulty: "하드", category: "monthly"},
    {id: "black_mage_extreme", name: "검은 마법사", difficulty: "익스트림", category: "monthly"},
    {id: "seren_normal", name: "선택받은 세렌", difficulty: "노멀", category: "endgame"},
    {id: "seren_hard", name: "선택받은 세렌", difficulty: "하드", category: "endgame"},
    {id: "seren_extreme", name: "선택받은 세렌", difficulty: "익스트림", category: "endgame"},
    {id: "kalos_easy", name: "감시자 칼로스", difficulty: "이지", category: "endgame"},
    {id: "kalos_normal", name: "감시자 칼로스", difficulty: "노멀", category: "endgame"},
    {id: "kalos_chaos", name: "감시자 칼로스", difficulty: "카오스", category: "endgame"},
    {id: "kalos_extreme", name: "감시자 칼로스", difficulty: "익스트림", category: "endgame"},
    {id: "kaling_easy", name: "카링", difficulty: "이지", category: "endgame"},
    {id: "kaling_normal", name: "카링", difficulty: "노멀", category: "endgame"},
    {id: "kaling_hard", name: "카링", difficulty: "하드", category: "endgame"},
    {id: "kaling_extreme", name: "카링", difficulty: "익스트림", category: "endgame"},
    {id: "limbo_normal", name: "림보", difficulty: "노멀", category: "endgame"},
    {id: "limbo_hard", name: "림보", difficulty: "하드", category: "endgame"},
    {id: "baldrix_normal", name: "발드릭스", difficulty: "노멀", category: "endgame"},
    {id: "baldrix_hard", name: "발드릭스", difficulty: "하드", category: "endgame"},
    {id: "first_adversary_easy", name: "최초의 대적자", difficulty: "이지", category: "endgame"},
    {id: "first_adversary_normal", name: "최초의 대적자", difficulty: "노멀", category: "endgame"},
    {id: "first_adversary_hard", name: "최초의 대적자", difficulty: "하드", category: "endgame"},
    {id: "first_adversary_extreme", name: "최초의 대적자", difficulty: "익스트림", category: "endgame"},
    {id: "jupiter_normal", name: "유피테르", difficulty: "노멀", category: "endgame"},
    {id: "jupiter_hard", name: "유피테르", difficulty: "하드", category: "endgame"},
];

const rateFilters = [30, 50, 75, 100];
const bossNames = Array.from(new Set(bosses.map((boss) => boss.name)));
const difficulties = ["이지", "노멀", "하드", "카오스", "익스트림"];

function getBossJudgement(rate: number) {
    if (rate >= 300) return "매우 여유";
    if (rate >= 200) return "쾌적";
    if (rate >= 150) return "안정";
    if (rate >= 100) return "15분 내 가능";
    if (rate >= 75) return "장기전 도전";
    return "스펙 보강 권장";
}

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "number") {
        return value.toLocaleString("ko-KR");
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

function normalizeStatName(value: unknown) {
    return formatValue(value)
        .replaceAll(" ", "")
        .replaceAll("%", "")
        .toLowerCase();
}

function getArray(data: unknown, keys: string[]) {
    if (!data || typeof data !== "object") {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of keys) {
        if (Array.isArray(record[key])) {
            return record[key] as Record<string, unknown>[];
        }
    }

    return [];
}

function findStatValue(data: unknown, labels: string[]) {
    const statItems = Array.isArray(data) ? data : getArray(data, ["final_stat"]);
    const normalizedLabels = labels.map(normalizeStatName);

    for (const label of labels) {
        const found = statItems.find((item) => {
            const statName = normalizeStatName(item.stat_name);
            const normalizedLabel = normalizeStatName(label);

            return statName === normalizedLabel || statName.includes(normalizedLabel);
        });

        if (found) {
            const value = formatValue(found.stat_value);

            if (value !== "-") {
                return value;
            }
        }
    }

    const found = statItems.find((item) => {
        const statName = normalizeStatName(item.stat_name);
        return normalizedLabels.some((label) => statName.includes(label));
    });

    if (found) {
        return formatValue(found.stat_value);
    }

    return "-";
}

function formatKoreanUnit(value: unknown) {
    const raw = formatValue(value).replaceAll(",", "");
    const number = Number(raw);

    if (!Number.isFinite(number)) {
        return formatValue(value);
    }

    const eok = Math.floor(number / 100000000);
    const man = Math.floor((number % 100000000) / 10000);
    const rest = number % 10000;
    const parts = [];

    if (eok > 0) {
        parts.push(`${eok.toLocaleString("ko-KR")}억`);
    }

    if (man > 0) {
        parts.push(`${man.toLocaleString("ko-KR")}만`);
    }

    if (rest > 0 || parts.length === 0) {
        parts.push(rest.toLocaleString("ko-KR"));
    }

    return parts.join(" ");
}

function dojangSummary(data: unknown) {
    if (!data || typeof data !== "object") {
        return "-";
    }

    const record = data as Record<string, unknown>;
    const floor = formatValue(record.dojang_best_floor);
    const time = formatValue(record.dojang_best_time);

    if (floor === "-") {
        return "-";
    }

    return time === "-" ? `${floor}층` : `${floor}층 / ${time}초`;
}

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

function CharacterHero({data}: {data: CharacterData}) {
    const basic = data.basic ?? {};
    const characterName = basic.character_name;
    const level = basic.character_level;
    const job = basic.character_class;
    const world = basic.world_name;
    const guild = basic.character_guild_name;
    const popularity = basic.character_popularity;
    const image = basic.character_image;
    const combatPower = formatKoreanUnit(findStatValue(data.characterStat, ["전투력"]));
    const bossDamage = findStatValue(data.characterStat, ["보스 몬스터 데미지", "보스 데미지"]);
    const dojang = dojangSummary(data.dojang);

    return (
        <section className={characterStyles.characterHero}>
            {image && (
                <div className={characterStyles.heroImageFrame}>
                    <Image
                        src={image}
                        alt={formatValue(characterName)}
                        width={260}
                        height={260}
                        unoptimized
                        className={characterStyles.heroImage}
                    />
                </div>
            )}

            <div className={characterStyles.heroMain}>
                <div className={characterStyles.nameRow}>
                    <h1 className={characterStyles.name}>{formatValue(characterName)}</h1>
                    <span className={characterStyles.worldTag}>
                        <span className={characterStyles.worldBadge} aria-label={`${world} 월드`}>
                            {formatValue(world).slice(0, 1)}
                        </span>
                        <span className={characterStyles.worldName}>{formatValue(world)}</span>
                    </span>
                </div>

                <p className={characterStyles.summary}>
                    <span>Lv.{formatValue(level)}</span>
                    <span>{formatValue(job)}</span>
                    <span>{guild ? guild : "길드 없음"}</span>
                    <span>인기도 {formatValue(popularity)}</span>
                </p>
            </div>

            <dl className={characterStyles.heroMetrics}>
                <div>
                    <dt>환산</dt>
                    <dd>-</dd>
                </div>
                <div>
                    <dt>전투력</dt>
                    <dd>{combatPower}</dd>
                </div>
                <div>
                    <dt>무릉</dt>
                    <dd>{dojang}</dd>
                </div>
                <div>
                    <dt>보스 배율</dt>
                    <dd>{bossDamage}</dd>
                </div>
            </dl>
        </section>
    );
}

function CharacterSearch({
    onSearch,
    error,
}: {
    onSearch: (name: string) => void;
    error: string;
}) {
    const [query, setQuery] = useState("");

    const submit = () => {
        const name = query.trim();

        if (name) {
            onSearch(name);
        }
    };

    return (
        <section className={styles.searchPanel}>
            <h1>보스 배율을 계산할 캐릭터를 검색하세요</h1>
            <div className={styles.searchBox}>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            submit();
                        }
                    }}
                    placeholder="캐릭터 닉네임"
                    aria-label="캐릭터 닉네임"
                />
                <button type="button" onClick={submit}>검색</button>
            </div>
            {error && <p>{error}</p>}
        </section>
    );
}

function getBossRate(_boss: BossEntry): number | null {
    return null;
}

function toggleValue(values: string[], value: string) {
    return values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
}

function BossFilters({
    filter,
    onChange,
    open,
    onToggle,
}: {
    filter: BossFilter;
    onChange: (filter: BossFilter) => void;
    open: boolean;
    onToggle: () => void;
}) {
    const activeCount = (filter.minRate === null ? 0 : 1) + filter.names.length + filter.difficulties.length;

    return (
        <div className={styles.filterWrap}>
            <button
                type="button"
                className={`${styles.filterToggle} ${open ? styles.filterToggleActive : ""}`}
                onClick={onToggle}
                aria-expanded={open}
            >
                필터{activeCount > 0 ? ` ${activeCount}` : ""}
            </button>

            {open && (
                <section className={styles.filterPanel} aria-label="보스 필터">
                    <div className={styles.filterGroup}>
                        <h2>배율</h2>
                        <div className={styles.filterButtons}>
                            {rateFilters.map((rate) => (
                                <button
                                    key={rate}
                                    type="button"
                                    className={filter.minRate === rate ? styles.filterButtonActive : ""}
                                    onClick={() => onChange({
                                        ...filter,
                                        minRate: filter.minRate === rate ? null : rate,
                                    })}
                                >
                                    {rate}%+
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <h2>보스</h2>
                        <div className={styles.filterButtons}>
                            {bossNames.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    className={filter.names.includes(name) ? styles.filterButtonActive : ""}
                                    onClick={() => onChange({
                                        ...filter,
                                        names: toggleValue(filter.names, name),
                                    })}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <h2>난이도</h2>
                        <div className={styles.filterButtons}>
                            {difficulties.map((difficulty) => (
                                <button
                                    key={difficulty}
                                    type="button"
                                    className={filter.difficulties.includes(difficulty) ? styles.filterButtonActive : ""}
                                    onClick={() => onChange({
                                        ...filter,
                                        difficulties: toggleValue(filter.difficulties, difficulty),
                                    })}
                                >
                                    {difficulty}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

function BossCard({boss}: {boss: BossEntry}) {
    const rate = getBossRate(boss);

    return (
        <article className={styles.bossCard}>
            <div className={styles.bossImagePlaceholder}>
                <span>IMG</span>
            </div>
            <strong>{boss.name}</strong>
            <span className={styles.difficulty}>{boss.difficulty}</span>
            <span className={styles.rate}>{rate === null ? "-%" : `${rate}%`}</span>
            <span className={styles.judgement}>{rate === null ? "계산 준비중" : getBossJudgement(rate)}</span>
        </article>
    );
}

function BossSection({
    title,
    category,
    items,
    action,
}: {
    title: string;
    category: BossCategory;
    items: BossEntry[];
    action?: React.ReactNode;
}) {
    const sectionItems = items.filter((boss) => boss.category === category);

    if (sectionItems.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2>{title}</h2>
                {action}
            </div>
            <div className={styles.bossGrid}>
                {sectionItems.map((boss) => (
                    <BossCard key={boss.id} boss={boss} />
                ))}
            </div>
        </section>
    );
}

export default function BossPage() {
    const [characterName, setCharacterName] = useState("");
    const [characterData, setCharacterData] = useState<CharacterData | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<BossFilter>({
        minRate: null,
        names: [],
        difficulties: [],
    });
    const [filterOpen, setFilterOpen] = useState(false);

    const loadCharacter = async (name: string) => {
        setStatus("loading");
        setError("");

        try {
            const res = await fetch(`/api/maple/character?name=${encodeURIComponent(name)}`, {
                cache: "no-store",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error ?? "캐릭터 정보를 불러오지 못했습니다.");
            }

            writeSearchName(name);
            setCharacterName(name);
            setCharacterData(data);
            setStatus("ready");
        } catch (fetchError) {
            setCharacterData(null);
            setStatus("error");
            setError(fetchError instanceof Error ? fetchError.message : "캐릭터 정보를 불러오지 못했습니다.");
        }
    };

    useEffect(() => {
        const storedName = readStoredName();

        if (!storedName) {
            setStatus("idle");
            return;
        }

        setCharacterName(storedName);
        void loadCharacter(storedName);
    }, []);

    if (status === "idle") {
        return (
            <main className={styles.page}>
                <CharacterSearch
                    onSearch={(name) => void loadCharacter(name)}
                    error={error}
                />
            </main>
        );
    }

    if (status === "loading") {
        return (
            <main className={styles.page}>
                <section className={styles.searchPanel}>
                    <h1>{characterName || "캐릭터"} 정보를 불러오는 중입니다.</h1>
                </section>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className={styles.page}>
                <CharacterSearch
                    onSearch={(name) => void loadCharacter(name)}
                    error={error}
                />
            </main>
        );
    }

    const filteredBosses = bosses.filter((boss) => {
        const rate = getBossRate(boss);

        if (filter.minRate !== null && (rate === null || rate < filter.minRate)) {
            return false;
        }

        if (filter.names.length > 0 && !filter.names.includes(boss.name)) {
            return false;
        }

        if (filter.difficulties.length > 0 && !filter.difficulties.includes(boss.difficulty)) {
            return false;
        }

        return true;
    });

    return (
        <main className={styles.page}>
            {characterData && <CharacterHero data={characterData} />}

            <section className={styles.notice}>
                <p>본 수치는 Maple Lab 자체 딜 지표입니다. (기준 : 주인장 캐릭터 - 환산6만 칼리)</p>
                <p>15분 클리어 기준을 바탕으로 보스별 예상 배율과 클리어 시간을 제공합니다.</p>
                <p>직업, 숙련도, 시드링, 극딜 구조, 보스 패턴에 따라 실제 결과와 차이가 날 수 있습니다.</p>
            </section>

            {filteredBosses.length > 0 ? (
                <>
                    <BossSection
                        title="주간 보스"
                        category="weekly"
                        items={filteredBosses}
                        action={(
                            <BossFilters
                                filter={filter}
                                onChange={setFilter}
                                open={filterOpen}
                                onToggle={() => setFilterOpen((open) => !open)}
                            />
                        )}
                    />
                    <BossSection title="상위 보스" category="endgame" items={filteredBosses} />
                    <BossSection title="월간 보스" category="monthly" items={filteredBosses} />
                </>
            ) : (
                <section className={styles.emptyState}>
                    조건에 맞는 보스가 없습니다.
                </section>
            )}
        </main>
    );
}
