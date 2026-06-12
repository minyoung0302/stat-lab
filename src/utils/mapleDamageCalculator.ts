import {getBossConfig} from "@/constants/mapleBossMap";
import {getJobConfig} from "@/constants/mapleJobMap";
import {getWeaponConstant, MAPLE_WEAPON_CONSTANTS} from "@/constants/mapleWeaponConstant";
import {
    getAttackPowerByJob,
    getMainSubStatByJob,
    parseFinalStats,
} from "@/utils/mapleStatParser";
import type {
    BossAnalysisResult,
    BossGrade,
    CalculateBaseDamageScoreParams,
    CalculateBossAnalysisParams,
} from "@/types/mapleBossAnalysis";

const bossGradeLabels: Record<BossGrade, string> = {
    insufficient: "딜 부족",
    close: "아슬아슬",
    clear: "클리어 가능",
    stable: "안정 클리어",
    comfortable: "여유 클리어",
};

export function calculateDefenseMultiplier(bossPdr: number, ignoreDefense: number): number {
    return Math.max(0, 1 - bossPdr * (1 - ignoreDefense / 100));
}

export function calculateCritMultiplier(critRate: number, critDamage: number): number {
    return 1 + critRate / 100 * (critDamage / 100);
}

export function calculateBaseDamageScore(params: CalculateBaseDamageScoreParams): number {
    const damageMultiplier = 1 + (params.damagePercent + params.bossDamagePercent) / 100;
    const finalDamageMultiplier = 1 + params.finalDamagePercent / 100;
    const critMultiplier = calculateCritMultiplier(params.critRate, params.critDamage);
    const defenseMultiplier = calculateDefenseMultiplier(params.bossPdr, params.ignoreDefense);

    return (
        (params.mainStat * 4 + params.subStat)
        * params.attackPower
        * params.weaponConstant
        * damageMultiplier
        * finalDamageMultiplier
        * critMultiplier
        * defenseMultiplier
        * params.jobCorrection
    );
}

export function calculateBossScore(baseDamageScore: number, bossRequiredDamageScore: number): number {
    if (bossRequiredDamageScore <= 0) {
        return 0;
    }

    return baseDamageScore / bossRequiredDamageScore * 100;
}

export function getBossGrade(score: number): BossGrade {
    if (score >= 150) return "comfortable";
    if (score >= 120) return "stable";
    if (score >= 100) return "clear";
    if (score >= 80) return "close";
    return "insufficient";
}

export function calculateBossAnalysis(params: CalculateBossAnalysisParams): BossAnalysisResult {
    const parsedStats = parseFinalStats(params.finalStat);
    const bossConfig = getBossConfig(params.bossId);
    const jobConfig = getJobConfig(params.jobName);
    const mainSubStat = getMainSubStatByJob(params.jobName, parsedStats);
    const attackPower = getAttackPowerByJob(params.jobName, parsedStats);
    const fallbackWeaponConstant = attackPower.attackType === "magic"
        ? MAPLE_WEAPON_CONSTANTS.defaultMagic
        : MAPLE_WEAPON_CONSTANTS.defaultPhysical;
    const weaponConstant = params.weaponConstant
        ?? getWeaponConstant(params.weaponType ?? jobConfig?.weaponType, fallbackWeaponConstant);
    const jobCorrection = params.jobCorrection ?? jobConfig?.jobCorrection ?? 1;
    const warnings = [
        ...parsedStats.warnings,
        ...mainSubStat.warnings,
        ...attackPower.warnings,
    ];

    if (!bossConfig) {
        warnings.push(`보스 '${params.bossId}'의 기준 정보가 없어 요구 딜 점수를 1로 계산했습니다.`);
    }

    if (weaponConstant <= 0) {
        warnings.push("무기 상수가 0 이하라 기본 무기 상수로 계산했습니다.");
    }

    const bossPdr = bossConfig?.bossPdr ?? 0;
    const bossRequiredDamageScore = bossConfig?.bossRequiredDamageScore ?? 1;
    const safeWeaponConstant = weaponConstant > 0 ? weaponConstant : fallbackWeaponConstant;
    const baseDamageScore = calculateBaseDamageScore({
        mainStat: mainSubStat.mainStat,
        subStat: mainSubStat.subStat,
        attackPower: attackPower.attackPower,
        weaponConstant: safeWeaponConstant,
        damagePercent: parsedStats.damagePercent,
        bossDamagePercent: parsedStats.bossDamagePercent,
        finalDamagePercent: parsedStats.finalDamagePercent,
        ignoreDefense: parsedStats.ignoreDefense,
        critRate: parsedStats.critRate,
        critDamage: parsedStats.critDamage,
        bossPdr,
        jobCorrection,
    });
    const bossScore = calculateBossScore(baseDamageScore, bossRequiredDamageScore);
    const grade = getBossGrade(bossScore);

    return {
        characterName: params.characterName,
        jobName: params.jobName,
        bossId: params.bossId,
        bossName: bossConfig ? `${bossConfig.difficulty} ${bossConfig.name}` : params.bossId,
        mainStatName: mainSubStat.mainStatName,
        mainStat: mainSubStat.mainStat,
        subStat: mainSubStat.subStat,
        attackType: attackPower.attackType,
        attackPower: attackPower.attackPower,
        damagePercent: parsedStats.damagePercent,
        bossDamagePercent: parsedStats.bossDamagePercent,
        finalDamagePercent: parsedStats.finalDamagePercent,
        ignoreDefense: parsedStats.ignoreDefense,
        critRate: parsedStats.critRate,
        critDamage: parsedStats.critDamage,
        weaponConstant: safeWeaponConstant,
        jobCorrection,
        bossPdr,
        bossRequiredDamageScore,
        baseDamageScore,
        bossScore,
        grade,
        gradeLabel: bossGradeLabels[grade],
        warnings,
    };
}
