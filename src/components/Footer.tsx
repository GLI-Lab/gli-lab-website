import Link from "next/link";

// bg-gray-800
// bg-gray-900
export default function Footer() {
    return (
        <footer className="w-full items-center text-center text-black text-[12px] sm:text-[13px] bg-[#f5f6f7] border-t">
            {/* Footer Inner (refer to Naver) */}
            <div className="sm:w-10/12 mx-auto">
                <div className="flex justify-center gap-3 sm:gap-5 pt-3 md:pt-4">
                    <Link className="hover:underline underline-offset-4" href="#">Contact Us</Link>
                    <p className="text-black/70">|</p>
                    <Link className="hover:underline underline-offset-4" href="#">Terms of Service</Link>
                    <p className="text-black/70">|</p>
                    <Link className="hover:underline underline-offset-4" href="#">Privacy</Link>
                </div>
                <div className="bg-[#f5f6f7] p-1 md:p-2"></div>
                <div className="bg-[#f5f6f7] pb-3 md:pb-4">
                    <p>
                        Copyright © 2024
                        <Link className="hover:underline underline-offset-4 font-semibold" href="/"> Graph Intelligence Lab. </Link>
                        All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

