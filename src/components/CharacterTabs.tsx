"use client";

import {useState} from "react";
import Image from "next/image";
import styles from "@/components/CharacterInfo.module.css";

type Item = Record<string, unknown>;
type Tab = "equipment" | "hexa" | "unionChampion";

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

function compactValues(values: unknown[]) {
    return values
        .map(formatValue)
        .filter((value) => value !== "-");
}

function finalStatValue(data: unknown, labels: string[]) {
    const record = asRecord(data);
    const stats = Array.isArray(record?.final_stat) ? record.final_stat : [];

    for (const label of labels) {
        const found = stats.find((item) => {
            if (!item || typeof item !== "object") {
                return false;
            }

            const statName = formatValue((item as Item).stat_name).replaceAll(" ", "");
            return statName === label.replaceAll(" ", "");
        });

        if (found && typeof found === "object") {
            return formatValue((found as Item).stat_value);
        }
    }

    return "-";
}

function asRecord(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    return value as Item;
}

function gradeClassName(grade: unknown) {
    const value = formatValue(grade);

    if (value.includes("레전")) {
        return styles.legendary;
    }

    if (value.includes("유니크")) {
        return styles.unique;
    }

    if (value.includes("에픽")) {
        return styles.epic;
    }

    if (value.includes("레어")) {
        return styles.rare;
    }

    return "";
}

function potentialGradeBadge(grade: unknown) {
    const value = formatValue(grade);

    if (value.includes("레전")) {
        return {
            label: "L",
            className: styles.potentialLegendaryBadge,
            titleClassName: styles.potentialLegendaryTitle,
        };
    }

    if (value.includes("유니크")) {
        return {
            label: "U",
            className: styles.potentialUniqueBadge,
            titleClassName: styles.potentialUniqueTitle,
        };
    }

    if (value.includes("에픽")) {
        return {
            label: "E",
            className: styles.potentialEpicBadge,
            titleClassName: styles.potentialEpicTitle,
        };
    }

    if (value.includes("레어")) {
        return {
            label: "R",
            className: styles.potentialRareBadge,
            titleClassName: styles.potentialRareTitle,
        };
    }

    return null;
}

function readableKey(key: string) {
    return key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

const optionLabels: Record<string, string> = {
    str: "STR",
    dex: "DEX",
    int: "INT",
    luk: "LUK",
    max_hp: "최대 HP",
    max_mp: "최대 MP",
    attack_power: "공격력",
    magic_power: "마력",
    armor: "방어력",
    speed: "이동속도",
    jump: "점프력",
    boss_damage: "보스 몬스터 공격 시 데미지",
    ignore_monster_armor: "몬스터 방어율 무시",
    all_stat: "올스탯",
    damage: "데미지",
    equipment_level_decrease: "착용 레벨 감소",
    max_hp_rate: "최대 HP",
    max_mp_rate: "최대 MP",
};

const optionKeys = [
    "str",
    "dex",
    "int",
    "luk",
    "max_hp",
    "max_mp",
    "attack_power",
    "magic_power",
    "armor",
    "speed",
    "jump",
    "boss_damage",
    "ignore_monster_armor",
    "all_stat",
    "damage",
    "equipment_level_decrease",
    "max_hp_rate",
    "max_mp_rate",
];

const gameOptionKeys = [
    "str",
    "dex",
    "int",
    "luk",
    "max_hp",
    "max_mp",
    "attack_power",
    "magic_power",
    "armor",
    "speed",
    "jump",
    "boss_damage",
    "ignore_monster_armor",
    "all_stat",
    "damage",
];

const gameOptionLabels: Record<string, string> = {
    ...optionLabels,
    ignore_monster_armor: "방어율 무시",
};

function hasOptionValue(value: unknown) {
    const formatted = formatValue(value);
    return formatted !== "-" && formatted !== "0" && formatted !== "+0" && formatted !== "0%";
}

function formatOptionValue(key: string, value: unknown) {
    const formatted = formatValue(value);

    if (formatted === "-") {
        return formatted;
    }

    if (key.includes("rate") || ["boss_damage", "ignore_monster_armor", "all_stat", "damage"].includes(key)) {
        return formatted.includes("%") ? formatted : `${formatted}%`;
    }

    if (/^-?\d+(,\d{3})*$/.test(formatted)) {
        return formatted.startsWith("-") ? formatted : `+${formatted}`;
    }

    return formatted;
}

function numericOptionValue(value: unknown) {
    const parsed = Number(formatValue(value).replaceAll(",", "").replace("%", ""));

    return Number.isFinite(parsed) ? parsed : 0;
}

function optionUnit(key: string) {
    return ["boss_damage", "ignore_monster_armor", "all_stat", "damage"].includes(key) ? "%" : "";
}

function plainOptionValue(key: string, value: number) {
    return `${value.toLocaleString("ko-KR")}${optionUnit(key)}`;
}

function signedOptionValue(key: string, value: number) {
    const sign = value < 0 ? "-" : "+";
    const absoluteValue = Math.abs(value).toLocaleString("ko-KR");

    return `${sign}${absoluteValue}${optionUnit(key)}`;
}

function starGroups(count: number) {
    return Array.from({length: 5}, (_, groupIndex) => {
        return Array.from({length: 5}, (_, starIndex) => {
            return groupIndex * 5 + starIndex < count;
        });
    });
}

function gameStatRows(item: Item) {
    const total = asRecord(item.item_total_option) ?? {};
    const base = asRecord(item.item_base_option) ?? {};
    const add = asRecord(item.item_add_option) ?? {};
    const etc = asRecord(item.item_etc_option) ?? {};
    const starforce = asRecord(item.item_starforce_option) ?? {};

    return gameOptionKeys
        .map((key) => {
            return {
                key,
                label: gameOptionLabels[key] ?? readableKey(key),
                totalValue: numericOptionValue(total[key]),
                baseValue: numericOptionValue(base[key]),
                addValue: numericOptionValue(add[key]),
                etcValue: numericOptionValue(etc[key]),
                starforceValue: numericOptionValue(starforce[key]),
            };
        })
        .filter((row) => row.totalValue !== 0);
}

function optionRows(value: unknown) {
    const record = asRecord(value);

    if (!record) {
        return [];
    }

    return optionKeys
        .filter((key) => hasOptionValue(record[key]))
        .map((key) => ({
            label: optionLabels[key] ?? readableKey(key),
            value: formatOptionValue(key, record[key]),
        }));
}

function EquipmentOptionSection({
    title,
    rows,
    muted = false,
}: {
    title: string;
    rows: {label: string; value: string}[];
    muted?: boolean;
}) {
    if (rows.length === 0) {
        return null;
    }

    return (
        <div className={styles.equipmentTooltipSection}>
            <h3>{title}</h3>
            <dl className={styles.equipmentTooltipStats}>
                {rows.map((row) => (
                    <div key={`${title}-${row.label}`} className={muted ? styles.equipmentTooltipMutedRow : ""}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function EquipmentTooltip({
    item,
    itemName,
    itemIcon,
    potentials,
    additionalPotentials,
    potentialBadge,
    additionalPotentialBadge,
}: {
    item: Item;
    itemName: string;
    itemIcon: string;
    potentials: string[];
    additionalPotentials: string[];
    potentialBadge: {label: string; className: string; titleClassName: string} | null;
    additionalPotentialBadge: {label: string; className: string; titleClassName: string} | null;
}) {
    const totalRows = optionRows(item.item_total_option);
    const statRows = gameStatRows(item);
    const starforce = formatValue(item.starforce);
    const starforceScrollFlag = formatValue(item.starforce_scroll_flag);
    const scrollUpgrade = formatValue(item.scroll_upgrade);
    const cuttableCount = formatValue(item.cuttable_count);
    const goldenHammerFlag = formatValue(item.golden_hammer_flag);
    const soulName = formatValue(item.soul_name);
    const soulOption = formatValue(item.soul_option);
    const description = formatValue(item.item_description);
    const itemPart = formatValue(item.item_equipment_part);
    const baseOption = asRecord(item.item_base_option);
    const requiredLevel = formatValue(baseOption?.base_equipment_level);
    const starforceCount = Math.min(Number(starforce.replaceAll(",", "")) || 0, 25);
    const starforceGroups = starGroups(starforceCount);

    return (
        <div className={styles.equipmentTooltip} role="tooltip">
            {starforceCount > 0 && (
                <div className={styles.equipmentTooltipStars}>
                    {starforceGroups.map((group, index) => (
                        <span key={`star-group-${index}`} className={styles.equipmentTooltipStarGroup}>
                            {group.map((filled, starIndex) => (
                                <span
                                    key={`star-${index}-${starIndex}`}
                                    className={filled ? "" : styles.equipmentTooltipEmptyStars}
                                >
                                    ★
                                </span>
                            ))}
                        </span>
                    ))}
                </div>
            )}

            <div className={styles.equipmentTooltipTitle}>
                <strong>{itemName}</strong>
                {itemPart !== "-" && <span>({itemPart})</span>}
            </div>

            <div className={styles.equipmentTooltipHero}>
                <div className={styles.equipmentTooltipIconBox}>
                    {itemIcon !== "-" && (
                        <Image
                            src={itemIcon}
                            alt={itemName}
                            width={64}
                            height={64}
                            unoptimized
                            className={styles.equipmentTooltipIcon}
                        />
                    )}
                </div>

                <div className={styles.equipmentTooltipMeta}>
                    {requiredLevel !== "-" && <strong>REQ LEV : {requiredLevel}</strong>}
                </div>
            </div>

            {description !== "-" && (
                <p className={styles.equipmentTooltipDescription}>{description}</p>
            )}

            <div className={styles.equipmentTooltipSection}>
                {itemPart !== "-" && <p className={styles.equipmentTooltipCategory}>장비 분류 : {itemPart}</p>}

                {statRows.length > 0 ? (
                    <dl className={styles.equipmentTooltipGameStats}>
                        {statRows.map((row) => (
                            <div key={row.key}>
                                <dt>{row.label} :</dt>
                                <dd>
                                    <strong>{plainOptionValue(row.key, row.totalValue)}</strong>
                                    <span>(</span>
                                    <span>{plainOptionValue(row.key, row.baseValue)}</span>
                                    <span className={styles.equipmentTooltipAdd}>{signedOptionValue(row.key, row.addValue)}</span>
                                    <span className={styles.equipmentTooltipEtc}>{signedOptionValue(row.key, row.etcValue)}</span>
                                    <span className={styles.equipmentTooltipStarforce}>{signedOptionValue(row.key, row.starforceValue)}</span>
                                    <span>)</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <EquipmentOptionSection title="장비 옵션" rows={totalRows} />
                )}

                {scrollUpgrade !== "-" && (
                    <p className={styles.equipmentTooltipRecovery}>업그레이드 가능 횟수 : {scrollUpgrade}</p>
                )}
                {cuttableCount !== "-" && (
                    <p className={styles.equipmentTooltipRecovery}>가위 사용 가능 횟수 : {cuttableCount}</p>
                )}
                {/*{goldenHammerFlag !== "-" && (*/}
                {/*    <p className={styles.equipmentTooltipRecovery}>황금망치 : {goldenHammerFlag}</p>*/}
                {/*)}*/}
                {starforceScrollFlag !== "-" && (
                    <p className={styles.equipmentTooltipRecovery}>스타포스 강화 : {starforceScrollFlag}</p>
                )}
            </div>

            {potentials.length > 0 && (
                <div className={styles.equipmentTooltipSection}>
                    <h3 className={`${styles.equipmentTooltipPotentialTitle} ${potentialBadge?.titleClassName ?? ""}`}>
                        {potentialBadge && (
                            <span className={`${styles.potentialBadge} ${potentialBadge.className}`}>
                                {potentialBadge.label}
                            </span>
                        )}
                        잠재 옵션
                    </h3>
                    <ul className={styles.equipmentTooltipOptions}>
                        {potentials.map((option) => (
                            <li key={option}>{option}</li>
                        ))}
                    </ul>
                </div>
            )}

            {additionalPotentials.length > 0 && (
                <div className={styles.equipmentTooltipSection}>
                    <h3 className={`${styles.equipmentTooltipPotentialTitle} ${additionalPotentialBadge?.titleClassName ?? ""}`}>
                        {additionalPotentialBadge && (
                            <span className={`${styles.potentialBadge} ${additionalPotentialBadge.className}`}>
                                {additionalPotentialBadge.label}
                            </span>
                        )}
                        에디셔널 잠재 옵션
                    </h3>
                    <ul className={styles.equipmentTooltipOptions}>
                        {additionalPotentials.map((option) => (
                            <li key={option}>{option}</li>
                        ))}
                    </ul>
                </div>
            )}

            {(soulName !== "-" || soulOption !== "-") && (
                <div className={styles.equipmentTooltipSection}>
                    <h3>소울</h3>
                    <p className={styles.equipmentTooltipSoul}>
                        {[soulName, soulOption].filter((value) => value !== "-").join(" / ")}
                    </p>
                </div>
            )}
        </div>
    );
}

function InfoCards({items, emptyText}: {items: Item[]; emptyText: string}) {
    if (items.length === 0) {
        return <p className={styles.emptyText}>{emptyText}</p>;
    }

    return (
        <div className={styles.compactGrid}>
            {items.map((item, index) => {
                const entries = Object.entries(item).filter(([, value]) => {
                    return value !== null && value !== undefined && value !== "";
                });
                const titleEntry = entries.find(([key]) => {
                    return key.endsWith("_name") || key.includes("name");
                });

                return (
                    <article key={index} className={styles.compactCard}>
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
    );
}

function EquipmentList({items}: {items: Item[]}) {
    if (items.length === 0) {
        return <p className={styles.emptyText}>착용 장비 정보가 없습니다.</p>;
    }

    return (
        <div className={styles.equipmentGrid}>
            {items.map((item) => {
                const itemName = formatValue(item.item_name);
                const itemIcon = formatValue(item.item_icon);
                const potentials = compactValues([
                    item.potential_option_1,
                    item.potential_option_2,
                    item.potential_option_3,
                ]);
                const additionalPotentials = compactValues([
                    item.additional_potential_option_1,
                    item.additional_potential_option_2,
                    item.additional_potential_option_3,
                ]);
                const potentialGradeClassName = gradeClassName(item.potential_option_grade);
                const additionalPotentialGradeClassName = gradeClassName(item.additional_potential_option_grade);
                const potentialBadge = potentialGradeBadge(item.potential_option_grade);
                const additionalPotentialBadge = potentialGradeBadge(item.additional_potential_option_grade);

                return (
                    <article
                        key={`${formatValue(item.item_equipment_slot)}-${itemName}`}
                        className={styles.equipmentCard}
                        tabIndex={0}
                    >
                        <div className={styles.equipmentIconBox}>
                            {itemIcon !== "-" && (
                                <Image
                                    src={itemIcon}
                                    alt={itemName}
                                    width={48}
                                    height={48}
                                    unoptimized
                                    className={styles.equipmentIcon}
                                />
                            )}
                        </div>

                        <div className={styles.equipmentInfo}>
                            <div className={styles.equipmentHeader}>
                                <span className={styles.equipmentSlot}>
                                    {formatValue(item.item_equipment_slot)}
                                </span>
                                <strong className={styles.equipmentName}>
                                    {itemName}
                                </strong>
                            </div>

                            <p className={styles.equipmentMeta}>
                                {`⭐${formatValue(item.starforce)}`}
                            </p>

                            {potentials.length > 0 && (
                                <p className={`${styles.equipmentOption} ${potentialGradeClassName}`}>
                                    <span className={styles.optionLabel}>잠재</span>
                                    <span className={styles.optionDivider}>|</span>
                                    <span>{potentials.join(" / ")}</span>
                                </p>
                            )}

                            {additionalPotentials.length > 0 && (
                                <p className={`${styles.equipmentOption} ${additionalPotentialGradeClassName}`}>
                                    <span className={styles.optionLabel}>에디</span>
                                    <span className={styles.optionDivider}>|</span>
                                    <span>{additionalPotentials.join(" / ")}</span>
                                </p>
                            )}
                        </div>

                        <EquipmentTooltip
                            item={item}
                            itemName={itemName}
                            itemIcon={itemIcon}
                            potentials={potentials}
                            additionalPotentials={additionalPotentials}
                            potentialBadge={potentialBadge}
                            additionalPotentialBadge={additionalPotentialBadge}
                        />
                    </article>
                );
            })}
        </div>
    );
}

function findField(item: Item, includes: string[]) {
    const entry = Object.entries(item).find(([key, value]) => {
        const normalizedKey = key.toLowerCase();
        return includes.every((part) => normalizedKey.includes(part)) && formatValue(value) !== "-";
    });

    return entry ? formatValue(entry[1]) : "-";
}

export function SymbolSection({items}: {items: Item[]}) {
    return (
        <section className={styles.sidebarSection}>
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

export function LinkSkillSection({items}: {items: Item[]}) {
    return (
        <section className={styles.sidebarSection}>
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

function StatSummary({
    characterStat,
    summaryStats,
}: {
    characterStat: unknown;
    summaryStats: {
        combatPower: string;
        convertedStat: string;
        bossDamage: string;
        ignoreDefense: string;
        criticalDamage: string;
    };
}) {
    const rows = [
        {label: "전투력", value: summaryStats.combatPower},
        {label: "환산", value: summaryStats.convertedStat},
        {label: "STR", value: finalStatValue(characterStat, ["STR"])},
        {label: "DEX", value: finalStatValue(characterStat, ["DEX"])},
        {label: "INT", value: finalStatValue(characterStat, ["INT"])},
        {label: "LUK", value: finalStatValue(characterStat, ["LUK"])},
        {label: "보공", value: summaryStats.bossDamage},
        {label: "방무", value: summaryStats.ignoreDefense},
        {label: "크뎀", value: summaryStats.criticalDamage},
    ];

    return (
        <aside className={styles.statSummary}>
            <h2 className={styles.sectionTitle}>스탯 요약</h2>
            <dl className={styles.statSummaryList}>
                {rows.map((row) => (
                    <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    );
}

function EquipmentPanel({
    equipmentItems,
    characterStat,
    summaryStats,
}: {
    equipmentItems: Item[];
    characterStat: unknown;
    summaryStats: {
        combatPower: string;
        convertedStat: string;
        bossDamage: string;
        ignoreDefense: string;
        criticalDamage: string;
    };
}) {
    return (
        <div className={styles.equipmentDashboard}>
            <StatSummary characterStat={characterStat} summaryStats={summaryStats} />

            <section className={styles.equipmentDashboardMain}>
                <h2 className={styles.sectionTitle}>장비 정보</h2>
                <EquipmentList items={equipmentItems} />
            </section>
        </div>
    );
}

function getStatList(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== "object") {
                return formatValue(item);
            }

            return formatValue((item as Item).stat);
        })
        .filter((stat) => stat !== "-");
}

function UnionChampionList({
    items,
    totalBadgeItems,
}: {
    items: Item[];
    totalBadgeItems: Item[];
}) {
    const totalStats = getStatList(totalBadgeItems);

    if (items.length === 0) {
        return <p className={styles.emptyText}>유니온 챔피언 정보가 없습니다.</p>;
    }

    return (
        <div className={styles.tabPanelStack}>
            {totalStats.length > 0 && (
                <section>
                    <h2 className={styles.sectionTitle}>챔피언 뱃지 총 효과</h2>
                    <div className={styles.unionBadgeList}>
                        {totalStats.map((stat, index) => (
                            <span key={`${stat}-${index}`} className={styles.unionBadge}>
                                {stat}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className={styles.sectionTitle}>유니온 챔피언</h2>
                <div className={styles.unionList}>
                    {items.map((item, index) => {
                        const name = formatValue(item.champion_name);
                        const slot = formatValue(item.champion_slot);
                        const grade = formatValue(item.champion_grade);
                        const job = formatValue(item.champion_class);
                        const badgeStats = getStatList(item.champion_badge_info);

                        return (
                            <article key={`${name}-${slot}-${index}`} className={styles.unionCard}>
                                <div className={styles.unionSlot}>
                                    {slot}
                                </div>

                                <div className={styles.unionInfo}>
                                    <div className={styles.unionNameRow}>
                                        <strong>{name}</strong>
                                        <span>{grade}</span>
                                    </div>
                                    <p>{job}</p>

                                    {badgeStats.length > 0 && (
                                        <div className={styles.unionBadgeList}>
                                            {badgeStats.map((stat, statIndex) => (
                                                <span key={`${stat}-${statIndex}`} className={styles.unionBadge}>
                                                    {stat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default function CharacterTabs({
    equipmentItems,
    characterStat,
    summaryStats,
    hexamatrixItems,
    hexamatrixStatItems,
    unionChampionItems,
    unionChampionBadgeTotalItems,
}: {
    equipmentItems: Item[];
    characterStat: unknown;
    summaryStats: {
        combatPower: string;
        convertedStat: string;
        bossDamage: string;
        ignoreDefense: string;
        criticalDamage: string;
    };
    hexamatrixItems: Item[];
    hexamatrixStatItems: Item[];
    unionChampionItems: Item[];
    unionChampionBadgeTotalItems: Item[];
}) {
    const [activeTab, setActiveTab] = useState<Tab>("equipment");

    return (
        <section className={styles.section}>
            <div className={styles.tabList}>
                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === "equipment" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("equipment")}
                >
                    장비
                </button>
                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === "hexa" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("hexa")}
                >
                    HEXA
                </button>
                <button
                    type="button"
                    className={`${styles.tabButton} ${activeTab === "unionChampion" ? styles.tabButtonActive : ""}`}
                    onClick={() => setActiveTab("unionChampion")}
                >
                    유니온 챔피언
                </button>
            </div>

            {activeTab === "equipment" && (
                <EquipmentPanel
                    equipmentItems={equipmentItems}
                    characterStat={characterStat}
                    summaryStats={summaryStats}
                />
            )}
            {activeTab === "hexa" && (
                <div className={styles.tabPanelStack}>
                    <div>
                        <h2 className={styles.sectionTitle}>헥사 매트릭스</h2>
                        <InfoCards
                            items={hexamatrixItems}
                            emptyText="헥사 매트릭스 정보가 없습니다."
                        />
                    </div>

                    <div>
                        <h2 className={styles.sectionTitle}>헥사 스탯</h2>
                        <InfoCards
                            items={hexamatrixStatItems}
                            emptyText="헥사 스탯 정보가 없습니다."
                        />
                    </div>
                </div>
            )}
            {activeTab === "unionChampion" && (
                <UnionChampionList
                    items={unionChampionItems}
                    totalBadgeItems={unionChampionBadgeTotalItems}
                />
            )}
        </section>
    );
}
