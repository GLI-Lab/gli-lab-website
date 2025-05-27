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
  lectureItems?: SemesterData[]  // 외부에서 데이터를 전달받을 수 있도록 추가
}

// 강의 데이터를 가져오는 함수 분리
export async function getLectureItems(): Promise<SemesterData[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'lecture.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');
  return yaml.load(yamlText) as SemesterData[];
}

export async function LectureList({ className = '', count = null, lectureItems }: LectureListProps) {
  // lectureItems가 전달되면 사용, 없으면 직접 가져오기 (하위 호환성)
  const rawData = lectureItems || await getLectureItems();
  
  // count가 지정되면 최신 학기부터 해당 개수만큼만 표시
  const semesterData = count ? rawData.slice(0, count) : rawData

  return (
    <div className={className}>
      {semesterData.map((semesterInfo, semesterIdx) => (
        <div key={semesterIdx} className="mb-6 last:mb-0">
          {/* 학기 헤더 */}
          <div className="mb-3">
            <span className="font-semibold bg-gray-100 px-2 py-1 rounded text-sm">
              {semesterInfo.semester}
            </span>
          </div>
          
          {/* 해당 학기의 강의 목록 - News와 유사한 그리드 스타일 */}
          <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 sm:gap-y-1">
            {semesterInfo.courses.map((course, courseIdx) => (
              <>
                <div key={`${semesterInfo.semester}-${courseIdx}`} className="contents leading-normal">
                  <div className="flex justify-center items-center">
                    {/* <span className="w-1 h-1 bg-gray-400 rounded-full"></span> */}
                  </div>
                  <div>
                    {course.title}, <span className="italic">{course.university}</span>
                  </div>
                </div>
                {courseIdx < semesterInfo.courses.length - 1 && (
                  <div className="col-span-2 border-b border-gray-200 my-1"></div>
                )}
              </>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 