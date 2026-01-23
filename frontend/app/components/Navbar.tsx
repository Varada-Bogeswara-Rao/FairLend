"use client";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="font-bold text-black text-lg">F</span>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-white">FairLend</h1>
                </div>

                <WalletMultiButton className="!bg-white/5 !hover:bg-white/10 !border !border-white/10 !rounded-xl !transition-all !font-semibold !h-11 !px-6" />
            </div>
        </nav>
    );
}
