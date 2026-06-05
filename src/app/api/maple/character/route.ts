import { NextResponse } from "next/server";

const BASE = "https://open.api.nexon.com/maplestory/v1";

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number) {
    return status === 429 || status >= 500;
}

async function nxfetch(url: string, retries = 2){
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const res = await fetch(url, {
                headers: {
                    accept: "application/json",
                    "x-nxopen-api-key": process.env.NEXON_API_KEY!},
                cache: "no-store",
            });

            if (!shouldRetry(res.status) || attempt === retries) {
                return res;
            }
        } catch (error) {
            lastError = error;

            if (attempt === retries) {
                throw error;
            }
        }

        await sleep(250 * (attempt + 1));
    }

    throw lastError;
}

async function readJson(res: Response) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchOptional(path: string, ocid: string, date?: string) {
    try {
        const res = await nxfetch(characterUrl(path, ocid, date));
        const data = await readJson(res);

        return {
            ok: res.ok,
            status: res.status,
            data,
            error: res.ok ? null : data,
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: error instanceof Error ? error.message : "request failed",
        };
    }
}

function characterUrl(path: string, ocid: string, date?: string) {
    const params = new URLSearchParams({ocid});

    if (date) {
        params.set("date", date);
    }

    return `${BASE}${path}?${params.toString()}`;
}

export async function GET(req: Request){
    const{searchParams} = new URL(req.url);
    const raw = searchParams.get("name")?.trim();
    const date = searchParams.get("date")?.trim();

    if(!raw){
        return NextResponse.json({error: "name is required"}, {status: 400});
    }

    const name = decodeURIComponent(raw).trim();

    // 1)name->ocid
    const idRes = await nxfetch(`${BASE}/id?character_name=${encodeURIComponent(name)}`);
    const idData = await idRes.json();

    if (!idRes.ok) {
        return NextResponse.json(idData, { status: idRes.status });
    }
    const ocid = idData?.ocid;
    if(!ocid){
        return NextResponse.json({ error: "ocid not found" }, {status: 404});
    }

    // 2)ocid->basic
    const basicRes = await nxfetch(characterUrl("/character/basic", ocid, date));
    const basicData = await readJson(basicRes);

    if (!basicRes.ok) {
        return NextResponse.json({ocid, basic: basicData}, {status: basicRes.status});
    }

    // 3)optional character details
    const [
        itemEquipment,
        symbolEquipment,
        linkSkill,
        vmatrix,
        hexamatrix,
        hexamatrixStat,
        unionChampion,
    ] = await Promise.all([
        fetchOptional("/character/item-equipment", ocid, date),
        fetchOptional("/character/symbol-equipment", ocid, date),
        fetchOptional("/character/link-skill", ocid, date),
        fetchOptional("/character/vmatrix", ocid, date),
        fetchOptional("/character/hexamatrix", ocid, date),
        fetchOptional("/character/hexamatrix-stat", ocid, date),
        fetchOptional("/user/union-champion", ocid, date),
    ]);

    return NextResponse.json(
        {
            ocid,
            basic: basicData,
            itemEquipment: itemEquipment.ok ? itemEquipment.data : null,
            itemEquipmentError: itemEquipment.error,
            symbolEquipment: symbolEquipment.ok ? symbolEquipment.data : null,
            symbolEquipmentError: symbolEquipment.error,
            linkSkill: linkSkill.ok ? linkSkill.data : null,
            linkSkillError: linkSkill.error,
            vmatrix: vmatrix.ok ? vmatrix.data : null,
            vmatrixError: vmatrix.error,
            hexamatrix: hexamatrix.ok ? hexamatrix.data : null,
            hexamatrixError: hexamatrix.error,
            hexamatrixStat: hexamatrixStat.ok ? hexamatrixStat.data : null,
            hexamatrixStatError: hexamatrixStat.error,
            unionChampion: unionChampion.ok ? unionChampion.data : null,
            unionChampionError: unionChampion.error,
        },
        {status: basicRes.status}
    );
}
