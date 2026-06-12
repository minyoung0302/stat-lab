import {getJobConfig} from "@/constants/mapleJobMap";
import type {
    AttackPowerResult,
    MainSubStatResult,
    MapleFinalStat,
    MapleStatName,
    ParsedMapleStats,
} from "@/types/mapleBossAnalysis";

const statNameMap: Record<string, keyof Omit<ParsedMapleStats, "warnings">> = {
    str: "str",
    dex: "dex",
    int: "int",
    luk: "luk",
    hp: "hp",
    maxhp: "hp",
    최대hp: "hp",
    공격력: "attackPower",
    마력: "magicPower",
    데미지: "damagePercent",
    보스몬스터데미지: "bossDamagePercent",
    보스데미지: "bossDamagePercent",
    최종데미지: "finalDamagePercent",
    방어율무시: "ignoreDefense",
    몬스터방어율무시: "ignoreDefense",
    크리티컬확률: "critRate",
    크확: "critRate",
    크리티컬데미지: "critDamage",
    크뎀: "critDamage",
};

const requiredStatKeys: {key: keyof Omit<ParsedMapleStats, "warnings">; label: string}[] = [
    {key: "str", label: "STR"},
    {key: "dex", label: "DEX"},
    {key: "int", label: "INT"},
    {key: "luk", label: "LUK"},
    {key: "attackPower", label: "공격력"},
    {key: "magicPower", label: "마력"},
    {key: "damagePercent", label: "데미지"},
    {key: "bossDamagePercent", label: "보스 몬스터 데미지"},
    {key: "finalDamagePercent", label: "최종 데미지"},
    {key: "ignoreDefense", label: "방어율 무시"},
    {key: "critRate", label: "크리티컬 확률"},
    {key: "critDamage", label: "크리티컬 데미지"},
];

function normalizeStatName(statName: string) {
    return statName
        .replaceAll(" ", "")
        .replaceAll("%", "")
        .toLowerCase();
}

function statValueByName(stats: ParsedMapleStats, statName: MapleStatName) {
    if (statName === "STR") return stats.str;
    if (statName === "DEX") return stats.dex;
    if (statName === "INT") return stats.int;
    if (statName === "LUK") return stats.luk;
    if (statName === "HP") return stats.hp;
    return 0;
}

function inferMainStat(stats: ParsedMapleStats): MapleStatName {
    const candidates: {name: MapleStatName; value: number}[] = [
        {name: "STR", value: stats.str},
        {name: "DEX", value: stats.dex},
        {name: "INT", value: stats.int},
        {name: "LUK", value: stats.luk},
    ];

    return candidates.sort((a, b) => b.value - a.value)[0]?.name ?? "SPECIAL";
}

function inferSubStat(mainStatName: MapleStatName): MapleStatName {
    if (mainStatName === "INT") return "LUK";
    if (mainStatName === "DEX") return "STR";
    if (mainStatName === "LUK") return "DEX";
    return "DEX";
}

export function parseNumberStat(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const parsed = Number(value.replaceAll(",", "").replace("%", "").trim());

    return Number.isFinite(parsed) ? parsed : 0;
}

export function parseFinalStats(finalStat: MapleFinalStat[]): ParsedMapleStats {
    const parsed: ParsedMapleStats = {
        str: 0,
        dex: 0,
        int: 0,
        luk: 0,
        hp: 0,
        attackPower: 0,
        magicPower: 0,
        damagePercent: 0,
        bossDamagePercent: 0,
        finalDamagePercent: 0,
        ignoreDefense: 0,
        critRate: 0,
        critDamage: 0,
        warnings: [],
    };
    const seenKeys = new Set<keyof Omit<ParsedMapleStats, "warnings">>();

    for (const stat of finalStat) {
        const key = statNameMap[normalizeStatName(stat.stat_name)];

        if (!key) {
            continue;
        }

        parsed[key] = parseNumberStat(stat.stat_value);
        seenKeys.add(key);
    }

    for (const required of requiredStatKeys) {
        if (!seenKeys.has(required.key)) {
            parsed.warnings.push(`${required.label} 값을 찾지 못해 0으로 계산했습니다.`);
        }
    }

    return parsed;
}

export function getMainSubStatByJob(jobName: string, stats: ParsedMapleStats): MainSubStatResult {
    const jobConfig = getJobConfig(jobName);
    const warnings: string[] = [];

    if (!jobConfig) {
        const mainStatName = inferMainStat(stats);
        const subStatName = inferSubStat(mainStatName);

        warnings.push(`직업 '${jobName}'의 매핑 정보가 없어 가장 높은 스탯을 주스탯으로 사용했습니다.`);

        return {
            mainStatName,
            subStatName,
            mainStat: statValueByName(stats, mainStatName),
            subStat: statValueByName(stats, subStatName),
            jobConfig: null,
            warnings,
        };
    }

    if (jobConfig.specialJobType === "xenon") {
        warnings.push("TODO: 제논은 STR/DEX/LUK 복합 스탯 직업이라 별도 계산식이 필요합니다.");
    }

    if (jobConfig.specialJobType === "demonAvenger") {
        warnings.push("TODO: 데몬어벤져는 HP 기반 직업이라 별도 계산식이 필요합니다.");
    }

    return {
        mainStatName: jobConfig.mainStat,
        subStatName: jobConfig.subStat,
        mainStat: statValueByName(stats, jobConfig.mainStat),
        subStat: statValueByName(stats, jobConfig.subStat),
        jobConfig,
        warnings,
    };
}

export function getAttackPowerByJob(jobName: string, stats: ParsedMapleStats): AttackPowerResult {
    const jobConfig = getJobConfig(jobName);
    const attackType = jobConfig?.attackType ?? (stats.magicPower > stats.attackPower ? "magic" : "attack");
    const attackPower = attackType === "magic" ? stats.magicPower : stats.attackPower;
    const warnings: string[] = [];

    if (!jobConfig) {
        warnings.push(`직업 '${jobName}'의 공격 타입 매핑 정보가 없어 공격력/마력 중 큰 값을 사용했습니다.`);
    }

    if (attackPower <= 0) {
        warnings.push(`${attackType === "magic" ? "마력" : "공격력"} 값을 찾지 못해 0으로 계산했습니다.`);
    }

    return {
        attackType,
        attackPower,
        warnings,
    };
}
