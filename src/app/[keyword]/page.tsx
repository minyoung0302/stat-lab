interface Props{
    params: { keyword: string };
}

export default async function SearchResultPage({params}: Props){
    const{keyword}=params;

    return (
        <main style={{ padding: 24 }}>
            <h1>검색 결과 페이지</h1>
            <p>
                검색어: <b>{keyword}</b>
            </p>

            {/* 여기서 API 호출해서 결과 보여주면 됩니다 */}
        </main>
    );
}