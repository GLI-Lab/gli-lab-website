import yaml from 'js-yaml'
import path from 'path';
import fs from 'fs/promises';

export interface NewsItem {
  date: string
  content: string
}

export async function NewsList({ className = '', count = 5 }) {
  // ------------------------------------------------------------------------------------------------
  // 로컬 파일 활용 - 로컬 fs 읽기
  //   유지되는 서버 디스크에 직접 붙어있는 경우
  //   -> news.yaml을 덮어쓰기만 하면, 바로 새 내용이 반영됨
  //   Vercel 같은 서버리스 배포 환경
  //   -> public 디렉토리는 "배포 시점 스냅샷"으로 묶여서 올라가기 때문에, 런타임에 파일을 바꿔도 반영되지 않음
  const filePath = path.join(process.cwd(), 'public', 'news.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');
  // ------------------------------------------------------------------------------------------------

  // ------------------------------------------------------------------------------------------------
  // 외부/로컬 파일 활용 - HTTP fetch (쿼리 파라미터+TTL 캐시 전략)
  // const currentDate = new Intl.DateTimeFormat('en-CA', {
  //   timeZone: 'Asia/Seoul',
  // }).format(new Date()).replace(/-/g, '')  // "20250518"

  // const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''  // base URL 끝 슬래시 제거
  // const url = `${base}/news.yaml?v=${currentDate}` // github page 같은 CDN 캐시 무효화화(하지만 어차피 원본이 수정되면 재캐시화 함)

  // const res = await fetch(url, 
  //   {
  //     cache: 'no-store',  // 배포환경 내 캐싱 비활성화 (런타임에 파일 교체 반영 가능)
  //     // next: { revalidate: 3600 }  // 3600초(1시간) 후 재검증
  //   }
  // )
  // if (!res.ok) {
  //   console.error('Fetch Error:', res.status, res.statusText)
  //   return <div className="text-red-500">뉴스를 불러올 수 없습니다.</div>
  // }
  // const yamlText = await res.text()
  // ------------------------------------------------------------------------------------------------

  const rawData = yaml.load(yamlText) as NewsItem[]
  const newsData = [...rawData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const latestNews = newsData.slice(0, count ?? newsData.length)

  return (
    <div className={className}>
      <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2">
        {latestNews.map((news, idx) => {
          const formattedDate = new Date(news.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
          });

          const [title, ...description] = news.content.split('\n');
          const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : '';

          return (
            <div key={`${news.date}-${idx}`} className="contents">
              <div className="font-semibold">
                [{formattedDate}]
              </div>
              <div>
                {title}{descriptionText && (<span className="italic">{descriptionText}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------------------------------------
// 예전 코드 (firebase 대신 assets/data/news.json 파일 사용)
// ------------------------------------------------------------------------------------------------
// "use client"

// import { useEffect, useState } from 'react'
// import { db } from '@/lib/firebase'
// import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'


// interface NewsItem {
//   date: string
//   content: string
// }

// export function NewsList({ className = '', count = 5 }) {
//   const [latestNews, setLatestNews] = useState<NewsItem[]>([])

//   useEffect(() => {
//     async function fetchNews() {
//       const q = query(
//         collection(db, 'news'),
//         orderBy('date', 'desc'),
//         limit(count)
//       )
//       const snap = await getDocs(q)
//       const data = snap.docs.map(doc => {
//         const { date, content } = doc.data()
//         return { date, content }
//       })
//       setLatestNews(data)
//     }
//     fetchNews()
//   }, [count])

//   return (
//     <div className={className}>
//       <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2">
//         {latestNews.map(news => {
//           const formattedDate = new Date(news.date).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short'
//           })
        
//           const [title, ...description] = news.content.replace(/\\n/g, '\n').split('\n')
//           const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : ''

//           return (
//             <div key={news.date} className="contents">
//               <div className="font-semibold">
//                 [{formattedDate}]
//               </div>
//               <div>
//                 {title}
//                 {descriptionText && (
//                   <span className="italic">
//                     {descriptionText}
//                   </span>
//                 )}
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// ------------------------------------------------------------------------------------------------
// 예전 코드 (firebase 대신 assets/data/news.json 파일 사용)
// ------------------------------------------------------------------------------------------------
// import newsData from '@/assets/data/news.json';

// export function NewsList({ className = '', count = newsData.length }) {
//   const latestNews = [...newsData]
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//     .slice(0, count);

//   return (
//     <div className={className}>
//       <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2">
//         {latestNews.map((news) => {
//           const formattedDate = new Date(news.date).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short'
//           });

//           const [title, ...description] = news.content.split('\n');
//           const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : '';

//           return (
//             <div key={news.date} className="contents">
//               <div className="font-semibold">
//                 [{formattedDate}]
//               </div>
//               <div>
//                 {title}
//                 {descriptionText && (
//                   <span className="italic">
//                     {descriptionText}
//                   </span>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// } 