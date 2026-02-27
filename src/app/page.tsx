'use client';
import {useMemo, useState} from "react"; /* useMemo : 계산 결과를 기억해두는 훅*/
import {useRouter, useSearchParams} from "next/navigation";

export default function Home() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = useMemo(() => params.get('q') ?? '', [params]);

  const [query, setQuery] = useState(initial);
  const [error, setError] = useState('');

  const onSubmit = () => {
    const q = query.trim();
    if(!q){
      setError('검색어를 입력해주세요.');
      return;
    }
    setError('');
    router.push(`/${q.trim()}`);
  };
  return (
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}>검색</h1>
          <p style={styles.desc}>닉네임을 입력해주세요.</p>

          <div style={styles.row}>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSubmit();
                }}
                placeholder=""
                style={styles.input}
            />
            <button onClick={onSubmit} style={styles.button}>
              검색
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 640,
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  },
  title: { margin: 0, fontSize: 28 },
  desc: { marginTop: 8, marginBottom: 16, color: '#6b7280' },
  row: { display: 'flex', gap: 10 },
  input: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: 16,
  },
  button: {
    padding: '12px 14px',
    borderRadius: 12,
    border: '1px solid #111827',
    background: '#111827',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  error: { marginTop: 12, color: '#ef4444' },
}