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

// check if an item is new (within 3 months)
function isNewItem(date?: string): boolean {
  if (!date) return false;
  const itemDate = new Date(date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);
  return itemDate >= sixMonthsAgo;
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
      <div className="grid grid-cols-[auto,1fr] gap-x-[0.5em] gap-y-[0.25em]">
        {latestNews.map((news, idx) => {
          const date = new Date(news.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const formattedDate = `${year}.${month}`;

          const [title, ...description] = news.content.split('\n');
          const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : '';

          return (
            <>
              <div key={`${news.date}-${idx}`} className="contents leading-snug">
                <div className="flex justify-center items-start -mt-0.5">
                  <div className="relative">
                    <span className="text-[0.8em] font-semibold bg-gray-100 px-[0.6em] py-[0.3em] rounded">
                      {formattedDate}
                    </span>
                    {isNewItem(news.date) && (
                      <span className="absolute -top-[0.65em] -left-1 text-[0.75em] text-red-500 transform -rotate-12 inline-flex">
                        <span className="animate-pulse" style={{animationDelay: '0ms'}}>N</span>
                        <span className="animate-pulse" style={{animationDelay: '100ms'}}>e</span>
                        <span className="animate-pulse" style={{animationDelay: '200ms'}}>w</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="">
                  {title}
                  {descriptionText && (
                    <div className="text-[0.9em] italic text-gray-600 mt-1">
                      {description.join(' ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
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
