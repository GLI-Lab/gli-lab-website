import NotFound from "@/app/not-found";
import {getMetadata} from "@/lib/GetMetadata";
import {Metadata} from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: `Introduction`,
  });
};

export default function Page() {
  return (
    <NotFound/>
  )
}


// export default function page() {
//   return (
//     <div className="min-h-screen bg-green-gradient">
//
//       {/* Hero Section */}
//       <section className="text-center py-20">
//         <h1 className="text-5xl font-bold text-white">Welcome to Our Website</h1>
//         <p className="text-light-green-200 mt-4">Building with Next.js & Tailwind CSS</p>
//         <button className="mt-8 bg-light-green-300 text-white font-bold py-2 px-4 rounded-full">
//           Get Started
//         </button>
//       </section>
//
//       {/* Features Section */}
//       <section className="py-20">
//         <div className="max-w-4xl mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-white rounded-lg p-6">
//               <h2 className="font-bold text-lg">Feature 1</h2>
//               <p className="text-light-green-300 mt-2">Description of feature 1.</p>
//             </div>
//             <div className="bg-white rounded-lg p-6">
//               <h2 className="font-bold text-lg">Feature 2</h2>
//               <p className="text-light-green-300 mt-2">Description of feature 2.</p>
//             </div>
//             <div className="bg-white rounded-lg p-6">
//               <h2 className="font-bold text-lg">Feature 3</h2>
//               <p className="text-light-green-300 mt-2">Description of feature 3.</p>
//             </div>
//           </div>
//         </div>
//       </section>
//
//       {/* Footer */}
//       <footer className="py-10 text-center text-white">
//         © 2024 Your Company. All rights reserved.
//       </footer>
//     </div>
//   )
// }
