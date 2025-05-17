import newsData from '@/assets/data/news.json';

export function NewsList({ className = '', count = newsData.length }) {
    const latestNews = [...newsData]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, count);

    return (
        <div className={className}>
            <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2">
                {latestNews.map((news) => {
                    const formattedDate = new Date(news.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                    });

                    const [title, ...description] = news.content.split('\n');
                    const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : '';

                    return (
                        <div key={news.date} className="contents">
                            <div className="font-semibold">
                                [{formattedDate}]
                            </div>
                            <div>
                                {title}
                                {descriptionText && (
                                    <span className="italic">
                                        {descriptionText}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
} 