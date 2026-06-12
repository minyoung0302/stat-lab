import type {MapleJobConfig, MapleStatName} from "@/types/mapleBossAnalysis";

function createJobConfig(
    jobName: string,
    aliases: string[],
    mainStat: MapleStatName,
    subStat: MapleStatName,
    attackType: "attack" | "magic",
    weaponType: string,
    jobCorrection = 1,
    specialJobType?: MapleJobConfig["specialJobType"],
): MapleJobConfig {
    return {
        jobName,
        aliases: [jobName, ...aliases],
        mainStat,
        subStat,
        attackType,
        weaponType,
        jobCorrection,
        specialJobType,
    };
}

export const MAPLE_JOB_MAP: MapleJobConfig[] = [
    createJobConfig("히어로", [], "STR", "DEX", "attack", "twoHandedSword"),
    createJobConfig("팔라딘", [], "STR", "DEX", "attack", "twoHandedBluntWeapon"),
    createJobConfig("다크나이트", [], "STR", "DEX", "attack", "spear"),
    createJobConfig("소울마스터", [], "STR", "DEX", "attack", "twoHandedSword"),
    createJobConfig("미하일", [], "STR", "DEX", "attack", "oneHandedSword"),
    createJobConfig("블래스터", [], "STR", "DEX", "attack", "knuckle"),
    createJobConfig("데몬슬레이어", [], "STR", "DEX", "attack", "oneHandedAxe"),
    createJobConfig("아란", [], "STR", "DEX", "attack", "polearm"),
    createJobConfig("카이저", [], "STR", "DEX", "attack", "twoHandedSword"),
    createJobConfig("아델", [], "STR", "DEX", "attack", "tuner"),
    createJobConfig("제로", [], "STR", "DEX", "attack", "twoHandedSword"),

    createJobConfig("아크메이지(불,독)", ["불독"], "INT", "LUK", "magic", "staff"),
    createJobConfig("아크메이지(썬,콜)", ["썬콜"], "INT", "LUK", "magic", "staff"),
    createJobConfig("비숍", [], "INT", "LUK", "magic", "staff"),
    createJobConfig("플레임위자드", [], "INT", "LUK", "magic", "staff"),
    createJobConfig("배틀메이지", [], "INT", "LUK", "magic", "staff"),
    createJobConfig("에반", [], "INT", "LUK", "magic", "staff"),
    createJobConfig("루미너스", [], "INT", "LUK", "magic", "staff"),
    createJobConfig("일리움", [], "INT", "LUK", "magic", "magicGauntlet"),
    createJobConfig("라라", [], "INT", "LUK", "magic", "wand"),
    createJobConfig("키네시스", [], "INT", "LUK", "magic", "lucentGauntlet"),

    createJobConfig("보우마스터", [], "DEX", "STR", "attack", "bow"),
    createJobConfig("신궁", [], "DEX", "STR", "attack", "crossbow"),
    createJobConfig("패스파인더", [], "DEX", "STR", "attack", "ancientBow"),
    createJobConfig("윈드브레이커", [], "DEX", "STR", "attack", "bow"),
    createJobConfig("와일드헌터", [], "DEX", "STR", "attack", "crossbow"),
    createJobConfig("메르세데스", [], "DEX", "STR", "attack", "dualBowguns"),
    createJobConfig("카인", [], "DEX", "STR", "attack", "whispershot"),

    createJobConfig("나이트로드", [], "LUK", "DEX", "attack", "claw"),
    createJobConfig("섀도어", [], "LUK", "DEX", "attack", "dagger"),
    createJobConfig("듀얼블레이더", [], "LUK", "DEX", "attack", "dagger"),
    createJobConfig("나이트워커", [], "LUK", "DEX", "attack", "claw"),
    createJobConfig("팬텀", [], "LUK", "DEX", "attack", "cane"),
    createJobConfig("카데나", [], "LUK", "DEX", "attack", "chain"),
    createJobConfig("호영", [], "LUK", "DEX", "attack", "ritualFan"),
    createJobConfig("칼리", [], "LUK", "DEX", "attack", "chakram"),

    createJobConfig("바이퍼", [], "STR", "DEX", "attack", "knuckle"),
    createJobConfig("캡틴", [], "DEX", "STR", "attack", "gun"),
    createJobConfig("캐논슈터", [], "STR", "DEX", "attack", "handCannon"),
    createJobConfig("스트라이커", [], "STR", "DEX", "attack", "knuckle"),
    createJobConfig("메카닉", [], "DEX", "STR", "attack", "gun"),
    createJobConfig("은월", [], "STR", "DEX", "attack", "knuckle"),
    createJobConfig("엔젤릭버스터", [], "DEX", "STR", "attack", "soulShooter"),
    createJobConfig("아크", [], "STR", "DEX", "attack", "knuckle"),

    createJobConfig("렌", [], "INT", "LUK", "magic", "memoria"),
    createJobConfig("제논", [], "SPECIAL", "SPECIAL", "attack", "energySword", 1, "xenon"),
    createJobConfig("데몬어벤져", [], "HP", "STR", "attack", "desperado", 1, "demonAvenger"),
];

function normalizeJobName(jobName: string) {
    return jobName.replaceAll(" ", "").toLowerCase();
}

export function getJobConfig(jobName: string) {
    const normalizedJobName = normalizeJobName(jobName);

    return MAPLE_JOB_MAP.find((config) => {
        return config.aliases.some((alias) => {
            const normalizedAlias = normalizeJobName(alias);
            return normalizedJobName === normalizedAlias || normalizedJobName.includes(normalizedAlias);
        });
    }) ?? null;
}
