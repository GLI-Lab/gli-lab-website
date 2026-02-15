import { Breadcrumb } from "@/components/Breadcrumb";

interface CoverProps {
  title: string;
  backgroundImage?: string;
  pattern?: 'diagonal-lines' | 'none';
  colorVariant?: 'neutral' | 'slate' | 'sage';
  showBreadcrumb?: boolean;
}

// https://github.com/bansal/pattern.css
const getPatternStyle = (pattern?: string, colorVariant?: string) => {
  // hex 색상을 rgba로 변환하는 헬퍼 함수
  const hexToRgba = (hex: string, alpha: number = 0.5) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const colorSchemes: Record<string, { primary: string; secondary: string; tertiary: string; quaternary: string; background: string }> = {
    neutral: {
      primary: '#d4d4d4',
      secondary: '#e5e5e5',
      tertiary: '#c8c8c8',
      quaternary: '#b8b8b8',
      background: '#f0f0f0'
    },
    slate: {
      primary: '#cbd5e1',
      secondary: '#e2e8f0',
      tertiary: '#94a3b8',
      quaternary: '#64748b',
      background: '#f1f5f9'
    },
    sage: {
      primary: '#bbd4c4',
      secondary: '#d4e5d9',
      tertiary: '#9cb8a8',
      quaternary: '#7a9b88',
      background: '#f0f5f1'
    }
  };

  const variant = (colorVariant && colorSchemes[colorVariant]) ? colorVariant : 'neutral';
  const colors = colorSchemes[variant];

  switch (pattern) {
    case 'diagonal-lines': {
      const lineColor = hexToRgba(colors.tertiary, 0.55);
      return {
        background: `
          repeating-linear-gradient(
            45deg,
            ${lineColor} 0,
            ${lineColor} 1px,
            transparent 0,
            transparent 50%
          )
        `,
        backgroundSize: '22px 22px',
        backgroundColor: colors.background
      };
    }
    default:
      return {};
  }
};

export function SubCover({ 
  title, 
  backgroundImage = '/images/cover/main4-3-dark.webp',
  pattern,
  colorVariant = 'neutral',
  showBreadcrumb = true
}: CoverProps) {    
  const isPattern = pattern && pattern !== 'none';
  const patternStyle = isPattern ? getPatternStyle(pattern, colorVariant) : {};
  const imageStyle = !isPattern ? { backgroundImage: `url('${backgroundImage}')` } : {};

  
  return (
    <div 
      className={`bg-center items-center justify-center text-center
                 py-12 lg:py-16 xl:py-20
                 ${isPattern ? '' : '[background-size:175%] md:[background-size:cover]'}`}
      style={{ ...patternStyle, ...imageStyle }}
    >
      <div className={`bg-white bg-opacity-50 rounded-md leading-none space-y-0 mx-auto
                      w-auto min-w-[200px] md:min-w-[300px] lg:min-w-[400px] inline-block px-8 md:px-10 lg:px-12 xl:px-14 py-3 md:py-4 lg:py-5`}>
        <p className={`tracking-tight font-bold
                      ${showBreadcrumb ? 'text-[30px] md:text-[34px] lg:text-[38px] xl:text-[40px]' : 'text-[32px] md:text-[36px] lg:text-[40px] xl:text-[44px] py-1'}`}>
          {title}
        </p>
        {showBreadcrumb && (
          <div className="pt-[9px] md:pt-[10px] lg:pt-[11px] xl:pt-[12px] text-[#555] text-[14px] md:text-[15px] lg:text-[16px]">
            <Breadcrumb />
          </div>
        )}
      </div>
    </div>
  )
}

export function MainCover() {
  return (
    <div className="relative overflow-hidden h-[320px] md:h-[400px] lg:h-[520px] xl:h-[600px] flex flex-col items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center animate-cinematic-1" 
        style={{ backgroundImage: 'url("/images/cover/main1-min-crop.webp")' }} 
      />
      <div 
        className="absolute inset-0 bg-cover bg-center animate-cinematic-2" 
        style={{ backgroundImage: 'url("/images/cover/main2.webp")' }} 
      />
      <div 
        className="absolute inset-0 bg-cover bg-center animate-cinematic-3" 
        style={{ backgroundImage: 'url("/images/cover/main3.webp")' }} 
      />
      <div 
        className="absolute inset-0 bg-cover bg-center animate-cinematic-4" 
        style={{ backgroundImage: 'url("/images/cover/main4-3.webp")' }} 
      />
      
      {/* 콘텐츠 */}
      <div className="relative z-10 w-full h-full">
        {/* 흰 박스: 컨테이너 정중앙 */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full bg-white bg-opacity-55 font-bold leading-none md:whitespace-nowrap
                        space-y-1 lg:space-y-2
                        p-2 md:p-3 lg:p-4 text-center">
          <p className="tracking-tight text-[36px] md:text-[44px] lg:text-[54px] xl:text-[60px]">
            Graph & Language Intelligence Lab.
          </p>
          <p className="tracking-tight text-[#777] text-[30px] md:text-[36px] lg:text-[42px] xl:text-[48px]">
            @ Konkuk Univ.
          </p>
        </div>

      </div>
    </div>
  )
}