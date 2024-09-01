import Link from "next/link";


// 후보 색상: #343539(진한 회색) / #f4f4f4(밝은 회색)
export default function Footer() {
    return (
        <footer className="w-full items-center text-center bg-[#343539]
                           text-[13px] md:text-[14px] lg:text-[15px]">
            {/* Footer Inner (refer to Naver) */}
            <div className="px-3 md:px-10 mx-auto">
                <div className="flex justify-center text-white/85
                                gap-3 sm:gap-5 pt-6 pb-3">
                    <Link className="hover:underline underline-offset-4" href="/about/contact">Contact Us</Link>
                    <p>|</p>
                    <Link className="hover:underline underline-offset-4" href="https://github.com/GLI-Lab/GLI-Lab">Terms of Service</Link>
                    <p>|</p>
                    <Link className="hover:underline underline-offset-4" href="https://github.com/GLI-Lab/GLI-Lab">Privacy</Link>
                    <p>|</p>
                    <Link className="hover:underline underline-offset-4" href="https://github.com/GLI-Lab/GLI-Lab">Github</Link>
                </div>
                <div className="pt-3 pb-6 text-white/85 border-t border-t-white border-opacity-20">
                <p>
                        Copyright © 2024
                        <Link className="hover:text-white hover:underline underline-offset-4 font-semibold" href="/">
                            <span> Graph Intelligence Lab. </span></Link>
                        <span className="block w-full md:w-auto md:inline">All Rights Reserved.</span>
                    </p>
                </div>
            </div>
        </footer>
    // <footer className="w-full items-center text-center bg-[#f4f4f4] border-t
    //                        text-[13px] md:text-[14px] lg:text-[15px]">
    //     {/* Footer Inner (refer to Naver) */}
    //     <div className="sm:w-10/12 mx-auto">
    //         <div className="flex justify-center border-b
    //                             gap-3 sm:gap-5 pt-4 pb-2">
    //             <Link className="hover:underline underline-offset-4" href="#">Contact Us</Link>
    //             <p>|</p>
    //             <Link className="hover:underline underline-offset-4" href="#">Terms of Service</Link>
    //             <p>|</p>
    //             <Link className="hover:underline underline-offset-4" href="#">Privacy</Link>
    //         </div>
    //         <div className="pt-2 pb-4">
    //             <p>
    //                 Copyright © 2024
    //                 <Link className="hover:text-green-900 hover:underline underline-offset-4 font-semibold"
    //                       href="/"> Graph Intelligence Lab. </Link>
    //                 All Rights Reserved.
    //             </p>
    //         </div>
    //     </div>
    // </footer>
)
}

