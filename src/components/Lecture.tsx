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
}

export async function LectureList({ className = '', count = null }: LectureListProps) {
  const filePath = path.join(process.cwd(), 'src', 'data', 'lecture.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');

  const rawData = yaml.load(yamlText) as SemesterData[]
  
  // count가 지정되면 최신 학기부터 해당 개수만큼만 표시
  const semesterData = count ? rawData.slice(0, count) : rawData

  return (
    <div className={className}>
      {semesterData.map((semesterInfo, semesterIdx) => (
        <div key={semesterIdx} className="mb-6 last:mb-0">
          {/* 학기 헤더 */}
          <div className="font-semibold mb-2">
            [{semesterInfo.semester}]
          </div>
          
          {/* 해당 학기의 강의 목록 */}
          <div className="ml-2 space-y-1">
            {semesterInfo.courses.map((course, courseIdx) => (
              <div key={courseIdx} className="flex">
                <span className="mr-2">-</span>
                <div>
                  {course.title}, <span className="italic">{course.university}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 