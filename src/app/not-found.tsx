import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                Halaman yang Anda cari tidak ada atau telah dipindahkan.
            </p>
            <Link href="/">
                <Button>Kembali ke Beranda</Button>
            </Link>
        </div>
    );
}
