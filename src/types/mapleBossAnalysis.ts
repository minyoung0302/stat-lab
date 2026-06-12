export type MapleStatName =
    | "STR"
    | "DEX"
    | "INT"
    | "LUK"
    | "HP"
    | "SPECIAL";

export type MapleAttackType = "attack" | "magic";

export type MapleSpecialJobType = "xenon" | "demonAvenger";

export type BossGrade =
    | "insufficient"
    | "close"
    | "clear"
    | "stable"
    | "comfortable";

export type MapleFinalStat = {
    stat_name: string;
    stat_value: string | number | null;
};

export type MapleCharacterStatResponse = {
    final_stat: MapleFinalStat[];
};

export type ParsedMapleStats = {
    str: number;
    dex: number;
    int: number;
    luk: number;
    hp: number;
    attackPower: number;
    magicPower: number;
    damagePercent: number;
    bossDamagePercent: number;
    finalDamagePercent: number;
    ignoreDefense: number;
    critRate: number;
    critDamage: number;
    warnings: string[];
};

export type MapleJobConfig = {
    jobName: string;
    aliases: string[];
    mainStat: MapleStatName;
    subStat: MapleStatName;
    attackType: MapleAttackType;
    weaponType: string;
    jobCorrection: number;
    specialJobType?: MapleSpecialJobType;
};

export type MapleBossConfig = {
    id: string;
    name: string;
    difficulty: string;
    bossPdr: number;
    bossRequiredDamageScore: number;
};

export type MainSubStatResult = {
    mainStatName: MapleStatName;
    subStatName: MapleStatName;
    mainStat: number;
    subStat: number;
    jobConfig: MapleJobConfig | null;
    warnings: string[];
};

export type AttackPowerResult = {
    attackType: MapleAttackType;
    attackPower: number;
    warnings: string[];
};

export type CalculateBaseDamageScoreParams = {
    mainStat: number;
    subStat: number;
    attackPower: number;
    weaponConstant: number;
    damagePercent: number;
    bossDamagePercent: number;
    finalDamagePercent: number;
    ignoreDefense: number;
    critRate: number;
    critDamage: number;
    bossPdr: number;
    jobCorrection: number;
};

export type CalculateBossAnalysisParams = {
    characterName: string;
    jobName: string;
    bossId: string;
    finalStat: MapleFinalStat[];
    weaponType?: string;
    weaponConstant?: number;
    jobCorrection?: number;
};

export type BossAnalysisResult = {
    characterName: string;
    jobName: string;
    bossId: string;
    bossName: string;
    mainStatName: MapleStatName;
    mainStat: number;
    subStat: number;
    attackType: MapleAttackType;
    attackPower: number;
    damagePercent: number;
    bossDamagePercent: number;
    finalDamagePercent: number;
    ignoreDefense: number;
    critRate: number;
    critDamage: number;
    weaponConstant: number;
    jobCorrection: number;
    bossPdr: number;
    bossRequiredDamageScore: number;
    baseDamageScore: number;
    bossScore: number;
    grade: BossGrade;
    gradeLabel: string;
    warnings: string[];
};
