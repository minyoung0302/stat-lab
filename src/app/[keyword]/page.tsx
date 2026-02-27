type Props = { params: Promise<{ keyword: string }> };

export default async function SearchResultPage({ params }: Props) {
    const { keyword } = await params;

    const BASE = "https://open.api.nexon.com/maplestory/v1";

    const name = decodeURIComponent(keyword).trim();

    const { headers } = await import("next/headers");
    const host = (await headers()).get("host");
    const idRes = await fetch(
        `http://${host}/api/maple/character?name=${encodeURIComponent(keyword)}`,
        {
            cache: "no-store",
        }
    );
    // const idText = await idRes.text(); // ✅ json 말고 text로 먼저 받기
    // return (
    //     <main style={{ padding: 24 }}>
    //         <h1>디버그</h1>
    //         <p>검색어: <b>{decodeURIComponent(keyword)}</b></p>
    //         <p>status: <b>{idRes.status}</b></p>
    //         <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{idText}</pre>
    //     </main>
    // );

    const idData = await idRes.json();

    if (!idRes.ok) {
        return (
            <main style={{ padding: 24 }}>
                <h1>API 에러</h1>
                <p>status: {idRes.status}</p>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(idData, null, 2)}</pre>
            </main>
        );
    }
    const basic = idData.basic;
    const imgUrl = basic?.character_image;

    if (!idData?.ocid) {
        return (
            <main style={{ padding: 24 }}>
                <h1>캐릭터를 찾을 수 없습니다</h1>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(idData, null, 2)}</pre>
            </main>
        );
    }

    // const basicRes = await fetch(
    //     `${BASE}/character/basic?ocid=${idData.ocid}`,
    //     {
    //         headers: {
    //             "x-nxopen-api-key": process.env.NEXON_API_KEY!,
    //         },
    //         cache: "no-store",
    //     }
    // );
    //
    // const basicData = await basicRes.json();

    return (
        <main style={{ padding: 24 }}>
            <h1>검색 결과</h1>
            <p>닉네임: <b>{name}</b></p>
            <p>ocid: <b>{idData.ocid}</b></p>
            {imgUrl} ? (
                    <div style={{ marginTop: 16 }}>
                        <img
                            src={imgUrl}
                            alt="캐릭터 이미지"
                            style={{
                                width: 180,
                                height: 180,
                                imageRendering: "pixelated",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                background: "#fff",
                            }}
                        />
                    </div>
                )


            <h2 style={{ marginTop: 16 }}>기본 정보</h2>
            <pre style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(idData.basic, null, 2)}
      </pre>
        </main>
    );
}