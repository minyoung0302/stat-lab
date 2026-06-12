export const MAPLE_WEAPON_CONSTANTS = {
    oneHandedSword: 1.2,
    oneHandedAxe: 1.2,
    oneHandedBluntWeapon: 1.2,
    dagger: 1.3,
    cane: 1.3,
    katara: 1.3,
    chakram: 1.3,
    wand: 1.2,
    staff: 1.2,
    twoHandedSword: 1.34,
    twoHandedAxe: 1.34,
    twoHandedBluntWeapon: 1.34,
    spear: 1.49,
    polearm: 1.49,
    bow: 1.3,
    crossbow: 1.35,
    ancientBow: 1.3,
    whispershot: 1.3,
    dualBowguns: 1.3,
    throwingStar: 1.75,
    claw: 1.75,
    knuckle: 1.7,
    gun: 1.5,
    handCannon: 1.5,
    soulShooter: 1.7,
    desperado: 1.3,
    energySword: 1.5,
    chain: 1.3,
    fan: 1.3,
    ritualFan: 1.3,
    tuner: 1.3,
    breathShooter: 1.3,
    magicGauntlet: 1.2,
    lucentGauntlet: 1.2,
    memoria: 1.3,
    defaultPhysical: 1.3,
    defaultMagic: 1.2,
} as const;

export type MapleWeaponType = keyof typeof MAPLE_WEAPON_CONSTANTS;

export function getWeaponConstant(weaponType: string | undefined, fallback: number) {
    if (!weaponType) {
        return fallback;
    }

    return MAPLE_WEAPON_CONSTANTS[weaponType as MapleWeaponType] ?? fallback;
}
