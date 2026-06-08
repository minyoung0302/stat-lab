import "./globals.css";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <body>
        <Header />
        <main style={styles.main}>
            {children}
        </main>
        </body>
        </html>
    );
}

const styles: Record<string, React.CSSProperties> = {
    main: {
        padding: "24px 24px 0",
    },
};
