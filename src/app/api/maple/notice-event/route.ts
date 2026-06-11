import {NextResponse} from "next/server";

const BASE = "https://open.api.nexon.com/maplestory/v1";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const noticeId = searchParams.get("notice_id")?.trim();
    const path = noticeId ? "/notice-event/detail" : "/notice-event";
    const params = new URLSearchParams();

    if (noticeId) {
        params.set("notice_id", noticeId);
    }

    try {
        const res = await fetch(`${BASE}${path}${params.size > 0 ? `?${params.toString()}` : ""}`, {
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
