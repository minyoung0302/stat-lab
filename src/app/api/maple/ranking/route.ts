import {NextResponse} from "next/server";

const BASE = "https://open.api.nexon.com/maplestory/v1";

const rankingPaths: Record<string, string> = {
    overall: "/ranking/overall",
    union: "/ranking/union",
    guild: "/ranking/guild",
    dojang: "/ranking/dojang",
    achievement: "/ranking/achievement",
};

const passthroughParams = [
    "date",
    "world_name",
    "world_type",
    "class",
    "ocid",
    "ranking_type",
    "difficulty",
    "page",
];

function defaultRankingDate() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    kst.setUTCDate(kst.getUTCDate() - 1);

    return kst.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const type = searchParams.get("type") ?? "overall";
    const path = rankingPaths[type];

    if (!path) {
        return NextResponse.json({error: "invalid ranking type"}, {status: 400});
    }

    const params = new URLSearchParams();

    for (const key of passthroughParams) {
        const value = searchParams.get(key)?.trim();

        if (value) {
            params.set(key, value);
        }
    }

    if (!params.has("date")) {
        params.set("date", defaultRankingDate());
    }

    if (type === "guild" && !params.has("ranking_type")) {
        params.set("ranking_type", "0");
    }

    if (type === "dojang" && !params.has("difficulty")) {
        params.set("difficulty", "0");
    }

    try {
        const res = await fetch(`${BASE}${path}?${params.toString()}`, {
            headers: {
                accept: "application/json",
                "x-nxopen-api-key": process.env.NEXON_API_KEY!,
            },
            cache: "no-store",
        });
        const data = await res.json().catch(() => null);

        return NextResponse.json(data, {status: res.status});
    } catch (error) {
        return NextResponse.json(
            {error: error instanceof Error ? error.message : "request failed"},
            {status: 500}
        );
    }
}
