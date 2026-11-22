/**
 * 직위·학기 글자(role.title)의 형광펜 밑줄.
 * 교수, 대학원생, 대학원 입학 예정자의 직위에 긋는다. 학부연구생(인턴)과 구분해 보이게 하려는 것이다.
 * 명단 표(Directory)와 프로필 페이지(목록형·카드 상세)가 같은 규칙과 같은 모양을 쓴다. 이름 호버 카드에는 긋지 않는다.
 */

/**
 * 형광펜을 긋는 직위 종류(role.type): 교수, 박사, 석박통합, 석사, 박사·석사 입학 예정.
 * 입학 예정자(iphd, ims)는 직위 글자가 아직 "Undergraduate Student"지만 대상이다.
 * 연구원(researcher)과 인턴(intern)은 긋지 않는다.
 */
const MARKED_TITLE_TYPES = ['faculty', 'phd', 'phd-ms', 'ms', 'iphd', 'ims'];

export function isMarkedTitleType(type: string | null | undefined): boolean {
  return type != null && MARKED_TITLE_TYPES.includes(type);
}

/**
 * 형광펜 밑줄의 모양. 글자의 아래쪽에 반투명한 띠가 겹쳐 보인다. 색은 캡틴 별과 같은 노란색(amber-500)이다.
 * 띠는 글자 뒤에 놓인 ::before이고(isolate로 이 글자 안에서만 뒤로 간다), 좌우로 4px씩 글자 밖으로 나온다.
 * 여백(padding)이 아니라서 글자의 자리는 바뀌지 않는다.
 * 크기와 위치는 글자 크기에 비례한다(em). 넓은 화면(md 이상)에서는 띠를 조금 더 얇게, 조금 더 아래에 둔다.
 * 줄바꿈 없이 한 줄인 글자(inline)에 붙여야 한다. 블록이나 flex 항목에 붙이면 띠가 줄 상자의 아래 끝에 맞춰져 글자에서 떨어진다.
 */
export const TITLE_MARKER =
  "relative isolate before:content-[''] before:absolute before:-z-10 before:-inset-x-1 before:bottom-[0.02em] md:before:bottom-[-0.12em] before:h-[0.35em] md:before:h-[0.3em] before:rounded-sm before:bg-amber-500/40";

/** 직위 글자. 형광펜 대상인 직위 종류면 밑줄을 긋고, 아니면 글자만 그린다 */
export function ProfileTitleText({ type, title }: { type: string | null | undefined; title: string }) {
  if (!isMarkedTitleType(type)) return <>{title}</>;
  return <span className={TITLE_MARKER}>{title}</span>;
}
