import { renderPeopleLayout } from '@/app/people/_lib/peopleLayout';

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return renderPeopleLayout('members', children);
}
