import { NextResponse } from "next/server";
import {headers} from "next/headers";

const BASE = "https://open.api.nexon.com/maplestory/v1"

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const name = searchParams.get("name")?.trim();
    if (!name) {
        return NextResponse.json({error: "name is required"}, {status: 400});
    }

    const res = await fetch(`${BASE}/id?character_name=${encodeURIComponent(name)}`,
        {
            headers: {
                "x-nxopen-api-key": process.env.NEXON_API_KEY!,
            },
            cache: "no-store",
        }
    );
    const data = await res.json();
    return NextResponse.json(data, {status: res.status});
}
