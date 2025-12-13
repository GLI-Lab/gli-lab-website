export function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, '') // 특수문자 제거 (한글은 유지, 하이픈은 끝에 배치)
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
}

