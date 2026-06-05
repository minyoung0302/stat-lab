import Image from "next/image";
import CharacterTabs from "@/components/CharacterTabs";
import styles from "@/components/CharacterInfo.module.css";

type Props = { params: Promise<{ keyword: string }> };

const fieldLabels: Record<string, string> = {
    character_name: "캐릭터명",
    world_name: "월드",
    character_gender: "성별",
    character_class: "직업",
    character_level: "레벨",
    character_exp: "경험치",
    character_exp_rate: "경험치 비율",
    character_popularity: "인기도",
    character_guild_name: "길드",
};

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

function readableKey(key: string) {
    return key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function shouldShowInfoField(key: string, value: unknown) {
    if (value === null || value === undefined || value === "") {
        return false;
    }

    const normalizedKey = key.toLowerCase();

    return !normalizedKey.includes("description") && !normalizedKey.includes("icon");
}

function InfoCardSection({
    title,
    items,
    emptyText,
}: {
    title: string;
    items: Record<string, unknown>[];
    emptyText: string;
}) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>

            {items.length > 0 ? (
                <div className={styles.compactGrid}>
                    {items.map((item, index) => {
                        const entries = Object.entries(item).filter(([key, value]) => {
                            return shouldShowInfoField(key, value);
                        });
                        const titleEntry = entries.find(([key]) => {
                            return key.endsWith("_name") || key.includes("name");
                        });
                        const iconEntry = Object.entries(item).find(([key, value]) => {
                            return key.toLowerCase().includes("icon") && formatValue(value) !== "-";
                        });
                        const iconUrl = iconEntry ? formatValue(iconEntry[1]) : "";

                        return (
                            <article key={index} className={styles.compactCard}>
                                {iconUrl && (
                                    <div className={styles.compactIconBox}>
                                        <Image
                                            src={iconUrl}
                                            alt={titleEntry ? formatValue(titleEntry[1]) : title}
                                            width={40}
                                            height={40}
                                            unoptimized
                                            className={styles.compactIcon}
                                        />
                                    </div>
                                )}

                                {titleEntry && (
                                    <strong className={styles.compactTitle}>
                                        {formatValue(titleEntry[1])}
                                    </strong>
                                )}

                                <dl className={styles.compactDetails}>
                                    {entries.map(([key, value]) => {
                                        if (key === titleEntry?.[0]) {
                                            return null;
                                        }

                                        return (
                                            <div key={key} className={styles.compactRow}>
                                                <dt>{readableKey(key)}</dt>
                                                <dd>{formatValue(value)}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <p className={styles.emptyText}>{emptyText}</p>
            )}
        </section>
    );
}

function SymbolSection({items}: {items: Record<string, unknown>[]}) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>장착 심볼</h2>

            {items.length > 0 ? (
                <div className={styles.symbolGrid}>
                    {items.map((symbol, index) => {
                        const name = formatValue(symbol.symbol_name);
                        const icon = formatValue(symbol.symbol_icon);
                        const level = formatValue(symbol.symbol_level);
                        const force = formatValue(symbol.symbol_force);

                        return (
                            <div key={`${name}-${index}`} className={styles.symbolItem}>
                                <div className={styles.symbolIconBox}>
                                    {icon !== "-" && (
                                        <Image
                                            src={icon}
                                            alt={name}
                                            width={42}
                                            height={42}
                                            unoptimized
                                            className={styles.symbolIcon}
                                        />
                                    )}

                                    <div className={styles.symbolTooltip}>
                                        <strong>{name}</strong>
                                        <span>포스 {force}</span>
                                    </div>

                                    <span className={styles.symbolLevel}>Lv.{level}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className={styles.emptyText}>장착 심볼 정보가 없습니다.</p>
            )}
        </section>
    );
}

function findField(item: Record<string, unknown>, includes: string[]) {
    const entry = Object.entries(item).find(([key, value]) => {
        const normalizedKey = key.toLowerCase();
        return includes.every((part) => normalizedKey.includes(part)) && formatValue(value) !== "-";
    });

    return entry ? formatValue(entry[1]) : "-";
}

function LinkSkillSection({items}: {items: Record<string, unknown>[]}) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>장착 링크</h2>

            {items.length > 0 ? (
                <div className={styles.symbolGrid}>
                    {items.map((skill, index) => {
                        const name = formatValue(skill.skill_name) !== "-"
                            ? formatValue(skill.skill_name)
                            : findField(skill, ["name"]);
                        const icon = formatValue(skill.skill_icon) !== "-"
                            ? formatValue(skill.skill_icon)
                            : findField(skill, ["icon"]);
                        const effect = formatValue(skill.skill_effect) !== "-"
                            ? formatValue(skill.skill_effect)
                            : findField(skill, ["effect"]);

                        return (
                            <div key={`${name}-${index}`} className={styles.symbolItem}>
                                <div className={styles.symbolIconBox}>
                                    {icon !== "-" && (
                                        <Image
                                            src={icon}
                                            alt={name}
                                            width={42}
                                            height={42}
                                            unoptimized
                                            className={styles.symbolIcon}
                                        />
                                    )}

                                    <div className={styles.linkTooltip}>
                                        <strong>{name}</strong>
                                        <span>{effect}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className={styles.emptyText}>장착 링크 정보가 없습니다.</p>
            )}
        </section>
    );
}

export default async function SearchResultPage({ params }: Props) {
    const { keyword } = await params;

    const name = decodeURIComponent(keyword).trim();

    const { headers } = await import("next/headers");
    const host = (await headers()).get("host");
    const characterRes = await fetch(
        `http://${host}/api/maple/character?name=${encodeURIComponent(name)}`,
        {
            cache: "no-store",
        }
    );

    const characterData = await characterRes.json();

    if (!characterRes.ok) {
        return (
            <main style={{ padding: 24 }}>
                <h1>API 에러</h1>
                <p>status: {characterRes.status}</p>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(characterData, null, 2)}</pre>
            </main>
        );
    }

    if (!characterData?.ocid || !characterData?.basic) {
        return (
            <main style={{ padding: 24 }}>
                <h1>캐릭터를 찾을 수 없습니다</h1>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(characterData, null, 2)}</pre>
            </main>
        );
    }

    const basic = characterData.basic;
    const characterName = basic.character_name ?? name;
    const level = basic.character_level;
    const job = basic.character_class;
    const world = basic.world_name;
    const guild = basic.character_guild_name;
    const popularity = basic.character_popularity;
    const image = basic.character_image;
    const basicEntries = Object.entries(basic).filter(([key]) => key in fieldLabels);
    const equipmentItems = characterData.itemEquipment?.item_equipment ?? [];
    const symbolItems = getArray(characterData.symbolEquipment, ["symbol"]);
    const linkSkillItems = getArray(characterData.linkSkill, [
        "character_link_skill",
        "character_owned_link_skill",
    ]);
    const hexamatrixItems = getArray(characterData.hexamatrix, ["character_hexa_core_equipment"]);
    const hexamatrixStatItems = getArray(characterData.hexamatrixStat, [
        "character_hexa_stat_core",
        "character_hexa_stat_core_2",
        "character_hexa_stat_core_3",
    ]);
    const unionChampionItems = getArray(characterData.unionChampion, ["union_champion"]);
    const unionChampionBadgeTotalItems = getArray(characterData.unionChampion, ["champion_badge_total_info"]);

    return (
        <main className={styles.page}>
            <div className={styles.contentGrid}>
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        {image && (
                            <div className={styles.imageFrame}>
                                <Image
                                    src={image}
                                    alt={characterName}
                                    width={260}
                                    height={260}
                                    unoptimized
                                    className={styles.image}
                                />
                            </div>
                        )}

                        <div className={styles.info}>
                            <div className={styles.titleBlock}>
                                <div className={styles.nameRow}>
                                    <h1 className={styles.name}>{characterName}</h1>
                                    <span className={styles.worldTag}>
                                        <span className={styles.worldBadge} aria-label={`${world} 월드`}>
                                            {world?.slice(0, 1) ?? "?"}
                                        </span>
                                        <span className={styles.worldName}>{world}</span>
                                    </span>
                                </div>

                                <p className={styles.summary}>
                                    <span>Lv.{formatValue(level)}</span>
                                    <span>{formatValue(job)}</span>
                                    <span>인기도 {formatValue(popularity)}</span>
                                    <span>{guild ? guild : "길드 없음"}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>기본 정보 전체</h2>

                        <dl className={styles.details}>
                            {basicEntries.map(([key, value]) => (
                                <div key={key} className={styles.detailRow}>
                                    <dt className={styles.detailKey}>
                                        {fieldLabels[key] ?? key}
                                    </dt>
                                    <dd className={styles.detailValue}>
                                        {formatValue(value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <SymbolSection items={symbolItems} />

                    <LinkSkillSection items={linkSkillItems} />

                </div>

                <CharacterTabs
                    equipmentItems={equipmentItems}
                    hexamatrixItems={hexamatrixItems}
                    hexamatrixStatItems={hexamatrixStatItems}
                    unionChampionItems={unionChampionItems}
                    unionChampionBadgeTotalItems={unionChampionBadgeTotalItems}
                />
            </div>
        </main>
    );
}
