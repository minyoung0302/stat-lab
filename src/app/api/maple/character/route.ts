import { NextResponse } from "next/server";

const BASE = "https://open.api.nexon.com/maplestory/v1";

async function nxfetch(url: string){
    return fetch(url, {
        headers: {
            accept: "application/json",
            "x-nxopen-api-key": process.env.NEXON_API_KEY!},
        cache: "no-store",
    });
}

export async function GET(req: Request){
    const{searchParams} = new URL(req.url);
    const raw = searchParams.get("name")?.trim();

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
    const basicRes = await nxfetch(`${BASE}/character/basic?ocid=${encodeURIComponent(ocid)}`);
    const basicData = await basicRes.json();

    return NextResponse.json({ocid, basic: basicData}, {status: basicRes.status});
}