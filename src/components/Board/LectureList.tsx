import yaml from 'js-yaml'
import path from 'path';
import fs from 'fs/promises';

export interface Course {
  title: string
  university: string
}

export interface SemesterData {
  semester: string
  courses: Course[]
}

export interface LectureListProps {
  className?: string
  count?: number | null
  lectureItems?: SemesterData[]
}

// check if a semester is new (within 6 months)
function isNewSemester(semester: string): boolean {
  // 학기 형식: "2025 Spring", "2025 Fall" 등
  const match = semester.match(/(\d{4})\s+(Spring|Fall)/i);
  if (!match) return false;
  
  const year = parseInt(match[1]);
  const semesterType = match[2].toLowerCase();
  
  // 학기를 날짜로 변환 (Spring: 3월, Fall: 9월 기준)
  const semesterDate = new Date(year, semesterType === 'spring' ? 2 : 8, 1); // 3월 또는 9월
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return semesterDate > sixMonthsAgo;
}

// 강의 데이터를 가져오는 함수 분리
export async function getLectureItems(): Promise<SemesterData[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'lecture.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');
  return yaml.load(yamlText) as SemesterData[];
}

function SemesterBlock({ semesterInfo }: { semesterInfo: SemesterData }) {
  return (
    <>
      {/* 학기 헤더 */}
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="relative">
          <span className="text-[0.8em] font-semibold bg-gray-100 px-[0.6em] py-[0.3em] rounded">
            {semesterInfo.semester}
          </span>
          {isNewSemester(semesterInfo.semester) && (
            <span className="absolute -top-[0.65em] -left-1 text-[0.7em] font-semibold text-red-500 transform -rotate-12 inline-flex">
              <span className="animate-pulse" style={{animationDelay: '0ms'}}>N</span>
              <span className="animate-pulse" style={{animationDelay: '100ms'}}>e</span>
              <span className="animate-pulse" style={{animationDelay: '200ms'}}>w</span>
            </span>
          )}
        </div>
        <div className="text-[0.9em] text-gray-600 text-right flex-shrink-0">
          <span className="font-semibold text-gray-900">{semesterInfo.courses.length}</span> lectures
        </div>
      </div>
      {/* 해당 학기의 강의 목록 */}
      <div className="space-y-1.5 pl-1">
        {semesterInfo.courses.map((course, courseIdx) => (
          <div key={`${semesterInfo.semester}-${courseIdx}`} className="text-[0.95em] leading-snug">
            {course.title}, <span className="text-[0.95em] italic text-gray-600">{course.university}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export async function LectureList({ className = '', count = null, lectureItems }: LectureListProps) {
  const rawData = lectureItems || await getLectureItems();
  const semesterData = count ? rawData.slice(0, count) : rawData;

  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`}>
      {semesterData.map((semesterInfo: SemesterData, semesterIdx: number) => (
        <div
          key={semesterIdx}
          className="w-full rounded-xl border border-gray-200 shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200 p-4 md:p-5 text-left overflow-hidden"
        >
          <SemesterBlock semesterInfo={semesterInfo} />
        </div>
      ))}
    </div>
  );
}
