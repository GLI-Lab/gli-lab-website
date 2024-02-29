import { JSX, SVGProps } from "react"

export default function ComingSoon() {
  return (
    <div className="flex mt-36 h-screen flex-col items-center text-center">
      <LoaderIcon className="h-40 w-40 animate-spin text-green-800"/>
      <h1 className="mt-8 text-2xl font-bold">Coming Soon</h1>
      <h1 className="mt-4 text-4xl font-bold">콘텐츠 준비 중입니다.</h1>
      <p className="mt-4 text-lg text-gray-700">
        콘텐츠 내용이 준비가 되지 않았습니다.
        <br/>
        가능한 빠른 시일 내에 업데이트하도록 하겠습니다.
        <br/>
        감사합니다.
      </p>
    </div>
  )
}

function LoaderIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="6" />
      <line x1="12" x2="12" y1="18" y2="22" />
      <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
      <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
      <line x1="2" x2="6" y1="12" y2="12" />
      <line x1="18" x2="22" y1="12" y2="12" />
      <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
      <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
    </svg>
  )
}

// export default function Component() {
//   return (
//     <div key="1" className="flex h-screen w-full flex-col items-center justify-center bg-white px-4 text-center">
//       <LoaderIcon className="h-32 w-32 animate-spin text-blue-600" />
//       <h1 className="mt-8 text-4xl font-bold">콘텐츠 준비 중입니다.</h1>
//       <p className="mt-4 text-lg text-gray-700">
//         콘텐츠 내용이 준비가 되지 않았습니다.
//         <br />
//         가공한 빌드 시간 내에 업데이트될 예정입니다.
//         <br />
//         감사합니다.
//       </p>
//       <p className="mt-4 text-lg text-gray-700">Coming Soon</p>
//     </div>
//   )
// }
//
// function LoaderIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <line x1="12" x2="12" y1="2" y2="6" />
//       <line x1="12" x2="12" y1="18" y2="22" />
//       <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
//       <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
//       <line x1="2" x2="6" y1="12" y2="12" />
//       <line x1="18" x2="22" y1="12" y2="12" />
//       <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
//       <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
//     </svg>
//   )
// }
