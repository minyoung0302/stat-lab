import {NextResponse} from "next/server";

const BASE = "https://open.api.nexon.com/maplestory/v1";

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function nxfetch(url: string) {
    let lastResponse: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await fetch(url, {
            headers: {
                accept: "application/json",
                "x-nxopen-api-key": process.env.NEXON_API_KEY!,
            },
            cache: "no-store",
        });

        if (response.status !== 429 && response.status < 500) {
            return response;
        }

        lastResponse = response;
        await wait(350 * (attempt + 1));
    }

    return lastResponse!;
}

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const name = searchParams.get("name")?.trim();

    if (!name) {
        return NextResponse.json({error: "name is required"}, {status: 400});
    }

    const idRes = await nxfetch(`${BASE}/id?character_name=${encodeURIComponent(name)}`);
    const idData = await idRes.json().catch(() => null);

    if (!idRes.ok) {
        return NextResponse.json(idData, {status: idRes.status});
    }

    const ocid = idData?.ocid;

    if (!ocid) {
        return NextResponse.json({error: "ocid not found"}, {status: 404});
    }

    const basicRes = await nxfetch(`${BASE}/character/basic?ocid=${encodeURIComponent(ocid)}`);
    const basicData = await basicRes.json().catch(() => null);

    return NextResponse.json({ocid, basic: basicData}, {status: basicRes.status});
}
