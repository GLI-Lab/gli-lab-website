import Link from "next/link";


export default function Footer() {
    return (
        <footer className="w-full items-center text-center bg-[#f4f4f4] border-t
                           text-[13px] md:text-[14px] lg:text-[15px]">
            {/* Footer Inner (refer to Naver) */}
            <div className="sm:w-10/12 mx-auto">
                <div className="flex justify-center border-b
                                gap-3 sm:gap-5 pt-4 pb-2">
                    <Link className="hover:underline underline-offset-4" href="#">Contact Us</Link>
                    <p>|</p>
                    <Link className="hover:underline underline-offset-4" href="#">Terms of Service</Link>
                    <p>|</p>
                    <Link className="hover:underline underline-offset-4" href="#">Privacy</Link>
                </div>
                <div className="pt-2 pb-4">
                    <p>
                        Copyright © 2024
                        <Link className="hover:text-green-900 hover:underline underline-offset-4 font-semibold" href="/"> Graph Intelligence Lab. </Link>
                        All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

