import Image from "next/image";
import CharacterTabs, {LinkSkillSection, SymbolSection} from "@/components/CharacterTabs";
import styles from "@/components/CharacterInfo.module.css";

type Props = { params: Promise<{ keyword: string }> };

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

function findStatValue(data: unknown, labels: string[]) {
    const statItems = getArray(data, ["final_stat"]);

    for (const label of labels) {
        const found = statItems.find((item) => {
            return formatValue(item.stat_name).replaceAll(" ", "") === label.replaceAll(" ", "");
        });

        if (found) {
            return formatValue(found.stat_value);
        }
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
    const combatPower = formatKoreanUnit(findStatValue(characterData.characterStat, ["전투력"]));
    const bossDamage = findStatValue(characterData.characterStat, ["보스 몬스터 데미지", "보스 데미지"]);
    const ignoreDefense = findStatValue(characterData.characterStat, ["방어율 무시"]);
    const criticalDamage = findStatValue(characterData.characterStat, ["크리티컬 데미지"]);
    const dojang = dojangSummary(characterData.dojang);

    return (
        <main className={styles.page}>
            <section className={styles.characterHero}>
                {image && (
                    <div className={styles.heroImageFrame}>
                        <Image
                            src={image}
                            alt={characterName}
                            width={260}
                            height={260}
                            unoptimized
                            className={styles.heroImage}
                        />
                    </div>
                )}

                <div className={styles.heroMain}>
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
                        <span>{guild ? guild : "길드 없음"}</span>
                        <span>인기도 {formatValue(popularity)}</span>
                    </p>
                </div>

                <dl className={styles.heroMetrics}>
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

            <CharacterTabs
                equipmentItems={equipmentItems}
                characterStat={characterData.characterStat}
                summaryStats={{
                    combatPower,
                    convertedStat: "-",
                    bossDamage,
                    ignoreDefense,
                    criticalDamage,
                }}
                hexamatrixItems={hexamatrixItems}
                hexamatrixStatItems={hexamatrixStatItems}
                unionChampionItems={unionChampionItems}
                unionChampionBadgeTotalItems={unionChampionBadgeTotalItems}
            />

            <section className={styles.characterSupport}>
                <SymbolSection items={symbolItems} />
                <LinkSkillSection items={linkSkillItems} />
            </section>
        </main>
    );
}
