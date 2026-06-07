import { renderPeopleLayout } from '@/app/people/_lib/peopleLayout';

export default async function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return renderPeopleLayout('alumni', children);
}
