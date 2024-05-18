"use client"

import {useEffect, useRef, useState} from "react";


export default function IframeWrapper() {
    const [activeIframe, setActiveIframe] = useState (false)
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleResize = (event: MessageEvent) => {
            if (event.data.type === 'setHeight' && iframeRef.current) {
                iframeRef.current.style.height = `${event.data.height}px`;
                setActiveIframe(true)
                // console.log(`${event.data.height}px`)
            }
        };

        window.addEventListener('message', handleResize);

        // 클린업 함수: 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
        return () => {
            window.removeEventListener('message', handleResize);
        };
    }, []);

    return (
        // invisible : 요소를 화면에서 숨기지만 레이아웃에 영향을 주고 싶을 때
        // hidden    : 요소를 완전히 숨겨서 레이아웃에도 영향을 주지 않게 할 때
        //             특히, 이벤트나 자식 요소와의 상호작용도 비활성화 됨
        <iframe className={`${activeIframe ? "block" : "invisible"} w-full`}
                ref={iframeRef} src="/bkoh/index.html" title="bkoh509.github.io"/>
        // <iframe className="w-full" ref={iframeRef} src="https://bkoh509.github.io" title="bkoh509.github.io"/>
    )
}