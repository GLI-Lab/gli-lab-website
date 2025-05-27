import yaml from 'js-yaml'
import path from 'path';
import fs from 'fs/promises';

export interface NewsItem {
  date: string
  content: string
}

export interface NewsListProps {
  className?: string
  count?: number | null
  newsItems?: NewsItem[]  // 외부에서 데이터를 전달받을 수 있도록 추가
}

// 뉴스 데이터를 가져오는 함수 분리
export async function getNewsItems(): Promise<NewsItem[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'news.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');
  const rawData = yaml.load(yamlText) as NewsItem[];
  return [...rawData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function NewsList({ className = '', count = null, newsItems }: NewsListProps) {
  // newsItems가 전달되면 사용, 없으면 직접 가져오기 (하위 호환성)
  const newsData = newsItems || await getNewsItems();
  const latestNews = count ? newsData.slice(0, count) : newsData;

  return (
    <div className={className}>
      <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 sm:gap-y-1 ">
        {latestNews.map((news, idx) => {
          // 2025.05 형식으로 날짜 포맷팅
          const date = new Date(news.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const formattedDate = `${year}.${month}`;

          const [title, ...description] = news.content.split('\n');
          const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : '';

          return (
            <>
              <div key={`${news.date}-${idx}`} className="contents leading-normal">
                <div className="flex justify-center items-center">
                  <span className="font-semibold bg-gray-100 px-2 py-1 rounded text-sm">
                    {formattedDate}
                  </span>
                </div>
                <div>
                  {title}{descriptionText && (<span className="italic">{descriptionText}</span>)}
                </div>
              </div>
              {idx < latestNews.length - 1 && (
                <div className="col-span-2 border-b border-gray-200 my-1"></div>
              )}
            </>
          );
        })}
      </div>
    </div>
  )
}
