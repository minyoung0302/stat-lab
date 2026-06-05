import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <body>
        <header style={styles.header}>
            <Link href="/" style={styles.logo}>
                <span style={styles.logoMark}>ML</span>
                <span>Maple Lab</span>
            </Link>
        </header>
        <main style={styles.main}>
            {children}
        </main>
        </body>
        </html>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        width: "100%",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "22px 24px 0",
    },
    logo: {
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        color: "#111827",
        textDecoration: "none",
        fontSize: 16,
        fontWeight: 900,
        lineHeight: 1,
    },
    logoMark: {
        display: "inline-grid",
        placeItems: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#111827",
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 900,
    },
    main: {
        padding: "20px 24px 0",
    },
};
