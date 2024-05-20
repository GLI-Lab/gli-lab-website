"use client"

import { useState, useEffect } from 'react';
import { IoChevronUp } from "react-icons/io5";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <>
            <div className="fixed bottom-6 right-6">
                {isVisible &&
                    (<button onClick={scrollToTop} className="p-2 border border-[#CCC] active:text-white rounded-md shadow-xl
                        bg-white hover:bg-[#f4f4f4] active:bg-[#888] transition duration-300"><IoChevronUp size={20} /></button>)
                }
            </div>
        </>
    );
};

export default ScrollToTop;
