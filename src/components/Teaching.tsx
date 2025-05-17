import teachingData from '@/assets/data/teaching.json';

export function TeachingList({ className = '', count = teachingData.length }) {
    const latestTeaching = [...teachingData]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, count);

    return (
        <div className={className}>
            <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-2">
                {latestTeaching.map((teaching) => {
                    const formattedDate = new Date(teaching.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                    });

                    const [title, ...description] = teaching.content.split('\n');
                    const descriptionText = description.length > 0 ? ` - ${description.join(' ')}` : '';

                    return (
                        <div key={teaching.date} className="contents">
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