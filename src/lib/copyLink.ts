/** 토스트와 버튼 사이의 간격(px) */
const TOAST_GAP = 10;
/** 토스트가 화면 가장자리에서 떨어져 있어야 하는 최소 거리(px) */
const VIEWPORT_MARGIN = 8;
/** 토스트가 떠 있는 시간(ms) */
const TOAST_DURATION = 1000;

interface CopyLinkOptions {
  /**
   * 토스트를 버튼의 어느 쪽에 먼저 띄울지. 기본은 오른쪽.
   * 그쪽에 자리가 없으면 반대쪽, 양쪽 다 없으면 버튼 아래에 띄운다.
   */
  placement?: 'right' | 'left';
}

/**
 * 주소를 클립보드에 복사하고, 누른 버튼 옆에 "Link copied!" 토스트를 잠깐 띄운다.
 * 링크 복사 버튼의 onClick에서 `copyLinkWithToast(url, e.currentTarget)`처럼 부른다.
 * 아이콘을 체크표시로 바꾸는 일은 각 컴포넌트의 상태로 따로 처리한다.
 */
export function copyLinkWithToast(
  url: string,
  button: HTMLElement,
  { placement = 'right' }: CopyLinkOptions = {}
): void {
  copyToClipboard(url);
  showToastNear(button, 'Link copied!', placement);
}

function copyToClipboard(text: string): void {
  // 클립보드 API가 없거나 실패하면 copy 이벤트에 값을 실어 복사한다.
  // 입력창을 만들어 선택하는 방식은 iOS에서 화면이 움직이므로 쓰지 않는다.
  const selectionlessCopy = () => {
    try {
      const listener = (event: ClipboardEvent) => {
        event.preventDefault();
        event.clipboardData?.setData('text/plain', text);
      };
      document.addEventListener('copy', listener);
      document.execCommand('copy');
      document.removeEventListener('copy', listener);
    } catch {
      // 마지막 수단: 아무 동작 안 함
    }
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(selectionlessCopy);
  } else {
    selectionlessCopy();
  }
}

/**
 * 버튼 옆에 토스트를 띄운다. 화면 밖으로 나가지 않는 자리를 고른다.
 * 순서: 먼저 고른 쪽 → 반대쪽 → 버튼 아래(가로로는 화면 안에 들어오게 당김).
 */
function showToastNear(button: HTMLElement, message: string, placement: 'right' | 'left'): void {
  const rect = button.getBoundingClientRect();

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className =
    'fixed bg-gray-600 text-white px-3 py-1.5 rounded-md shadow-md text-[15px] font-medium z-[1000] pointer-events-none whitespace-nowrap';
  // 크기를 재려면 먼저 문서에 붙여야 한다. 위치는 같은 작업 안에서 바로 정하므로 깜빡이지 않는다.
  document.body.appendChild(toast);

  const width = toast.offsetWidth;
  const height = toast.offsetHeight;
  const viewportWidth = document.documentElement.clientWidth;

  const rightSide = rect.right + TOAST_GAP;
  const leftSide = rect.left - TOAST_GAP - width;
  const fitsRight = rightSide + width <= viewportWidth - VIEWPORT_MARGIN;
  const fitsLeft = leftSide >= VIEWPORT_MARGIN;

  let left: number;
  let top = rect.top + rect.height / 2 - height / 2;

  if (placement === 'right' ? fitsRight : fitsLeft) {
    left = placement === 'right' ? rightSide : leftSide;
  } else if (placement === 'right' ? fitsLeft : fitsRight) {
    left = placement === 'right' ? leftSide : rightSide;
  } else {
    const centered = rect.left + rect.width / 2 - width / 2;
    left = Math.min(Math.max(centered, VIEWPORT_MARGIN), viewportWidth - width - VIEWPORT_MARGIN);
    top = rect.bottom + TOAST_GAP;
  }

  toast.style.left = `${left}px`;
  toast.style.top = `${top}px`;

  setTimeout(() => toast.remove(), TOAST_DURATION);
}
