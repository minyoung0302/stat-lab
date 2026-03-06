import "./globals.css";
import Header from "@/components/Header";
//import SubNav from "@/components/SubNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
        <body>
        <Header />
        {/* <SubNav /> */}


        {/* Header(60) + SubNav(44) 만큼 여백 */}
        <main style={{ paddingTop: 120, paddingLeft: 24, paddingRight: 24 }}>
            {children}
        </main>
        </body>
        </html>
    );
}