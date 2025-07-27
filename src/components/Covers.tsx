import { Breadcrumb } from "@/components/Breadcrumb";

interface CoverProps {
  title: string;
  backgroundImage?: string;
  pattern?: 'geometric' | 'diagonal' | 'diagonal-reverse' | 'diagonal-check' | 'diagonal-diamond' | 'diagonal-wide' | 'diagonal-lines-sm' | 'solid' | 'complex-weave' | 'dots' | 'dots-ring' | 'none';
  colorVariant?: 'neutral' | 'warm-gray' | 'cool-gray' | 'charcoal' | 'pearl' | 'sage' | 'mint' | 'eucalyptus' | 'forest' | 'olive' | 'seafoam' | 'moss' | 'pine';
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

  // 색상 조합 정의 (그레이 + 초록색 계열)
  const colorSchemes = {
    // 그레이 계열
    neutral: {
      primary: '#d4d4d4',
      secondary: '#e5e5e5', 
      tertiary: '#c8c8c8',
      quaternary: '#b8b8b8',
      background: '#f0f0f0'
    },
    'warm-gray': {
      primary: '#d0ccc8',
      secondary: '#ddd9d5',
      tertiary: '#c3bfbb',
      quaternary: '#b6b2ae',
      background: '#ebe9e7'
    },
    'cool-gray': {
      primary: '#d1d5d8',
      secondary: '#dee2e5',
      tertiary: '#c4c8cb',
      quaternary: '#b7bbbe',
      background: '#f2f4f5'
    },
    charcoal: {
      primary: '#a8a8a8',
      secondary: '#b8b8b8',
      tertiary: '#989898',
      quaternary: '#888888',
      background: '#e0e0e0'
    },
    pearl: {
      primary: '#e8e8e8',
      secondary: '#f0f0f0',
      tertiary: '#e0e0e0',
      quaternary: '#d8d8d8',
      background: '#f8f8f8'
    },
    // 초록색 계열
    sage: {
      primary: '#c7d2cc',
      secondary: '#d4ddd7',
      tertiary: '#b8c5bc',
      quaternary: '#a9b8ad',
      background: '#f0f3f1'
    },
    mint: {
      primary: '#c8d5d0',
      secondary: '#d5e0db',
      tertiary: '#b9c6c1',
      quaternary: '#aab9b4',
      background: '#f1f4f2'
    },
    eucalyptus: {
      primary: '#c5d3ce',
      secondary: '#d2dfd9',
      tertiary: '#b6c4bf',
      quaternary: '#a7b7b0',
      background: '#f0f3f1'
    },
    forest: {
      primary: '#bcc9c4',
      secondary: '#c9d4cf',
      tertiary: '#adbab5',
      quaternary: '#9eada6',
      background: '#eff2f0'
    },
    olive: {
      primary: '#c9d0c7',
      secondary: '#d6ddd4',
      tertiary: '#bac3b8',
      quaternary: '#abb6a9',
      background: '#f2f3f1'
    },
    seafoam: {
      primary: '#c6d4d1',
      secondary: '#d3e0dd',
      tertiary: '#b7c7c2',
      quaternary: '#a8bab3',
      background: '#f0f4f2'
    },
    moss: {
      primary: '#c4cfc6',
      secondary: '#d1dcd3',
      tertiary: '#b5c2b7',
      quaternary: '#a6b5a8',
      background: '#f1f3f1'
    },
    pine: {
      primary: '#c1cdc5',
      secondary: '#ced9d2',
      tertiary: '#b2c0b6',
      quaternary: '#a3b3a7',
      background: '#eff2f0'
    }
  };

  const variant = colorVariant as keyof typeof colorSchemes || 'neutral';
  const colors = colorSchemes[variant];

  switch (pattern) {
    case 'geometric':
      return {
        background: `
          linear-gradient(135deg, ${colors.primary} 25%, transparent 25%),
          linear-gradient(-135deg, ${colors.primary} 25%, transparent 25%),
          linear-gradient(45deg, ${colors.secondary} 25%, transparent 25%),
          linear-gradient(-45deg, ${colors.secondary} 25%, transparent 25%)
        `,
        backgroundSize: '60px 60px',
        backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
        backgroundColor: colors.background
      };
    case 'diagonal':
      return {
        background: `
          repeating-linear-gradient(
            45deg,
            ${colors.primary},
            ${colors.primary} 20px,
            ${colors.secondary} 20px,
            ${colors.secondary} 40px,
            ${colors.tertiary} 40px,
            ${colors.tertiary} 60px
          )
        `,
        backgroundColor: colors.background
      };
    case 'diagonal-reverse':
      return {
        background: `
          repeating-linear-gradient(
            -45deg,
            ${colors.primary},
            ${colors.primary} 20px,
            ${colors.secondary} 20px,
            ${colors.secondary} 40px,
            ${colors.tertiary} 40px,
            ${colors.tertiary} 60px
          )
        `,
        backgroundColor: colors.background
      };
    case 'diagonal-check':
      return {
        background: `
          linear-gradient(-45deg, ${hexToRgba(colors.tertiary)} 25%, transparent 25%, transparent 50%, ${hexToRgba(colors.tertiary)} 50%, ${hexToRgba(colors.tertiary)} 75%, transparent 75%, transparent 100%),
          linear-gradient(45deg, ${hexToRgba(colors.quaternary)} 25%, transparent 25%, transparent 50%, ${hexToRgba(colors.quaternary)} 50%, ${hexToRgba(colors.quaternary)} 75%, transparent 75%, transparent 100%)
        `,
        backgroundSize: '52px 52px',
        backgroundColor: colors.background
      };
    case 'diagonal-diamond':
      return {
        backgroundColor: colors.background,
        backgroundImage: `
          linear-gradient(45deg, ${colors.tertiary} 25%, transparent 25%, transparent 75%, ${colors.tertiary} 75%, ${colors.tertiary}), 
          linear-gradient(-45deg, ${colors.tertiary} 25%, transparent 25%, transparent 75%, ${colors.tertiary} 75%, ${colors.tertiary})
        `,
        backgroundSize: '25px 25px'
      };
    case 'diagonal-wide':
      return {
        background: `
          repeating-linear-gradient(
            45deg,
            ${colors.secondary},
            ${colors.secondary} 40px,
            ${colors.tertiary} 40px,
            ${colors.tertiary} 80px
          )
        `,
        backgroundColor: colors.background
      };
    case 'diagonal-lines-sm':
      return {
        background: `
          repeating-linear-gradient(
            45deg,
            ${colors.tertiary} 0,
            ${colors.tertiary} 1px,
            transparent 0,
            transparent 50%
          )
        `,
        backgroundSize: '20px 20px',
        backgroundColor: colors.background
      };
    case 'solid':
      return {
        backgroundColor: colors.tertiary,
        backgroundImage: 'none'
      };
    case 'complex-weave':
      return {
        backgroundColor: colors.background,
        backgroundImage: `
          linear-gradient(27deg, ${colors.primary} 5px, transparent 5px),
          linear-gradient(207deg, ${colors.primary} 5px, transparent 5px),
          linear-gradient(27deg, ${colors.secondary} 5px, transparent 5px),
          linear-gradient(207deg, ${colors.secondary} 5px, transparent 5px),
          linear-gradient(90deg, ${colors.tertiary} 10px, transparent 10px),
          linear-gradient(${colors.quaternary} 25%, ${colors.primary} 25%, ${colors.primary} 50%, transparent 50%, transparent 75%, ${colors.secondary} 75%, ${colors.secondary})
        `,
        backgroundPosition: '0 5px, 10px 0px, 0px 10px, 10px 5px, 0 0, 0 0',
        backgroundSize: '20px 20px'
      };
    case 'dots':
      return {
        background: colors.background,
        backgroundImage: `
          radial-gradient(${colors.tertiary} 20%, transparent 0), 
          radial-gradient(${colors.tertiary} 20%, transparent 0)
        `,
        backgroundPosition: '0 0, 10px 10px',
        backgroundSize: '20px 20px'
      };
    case 'dots-ring':
      return {
        backgroundColor: colors.background,
        backgroundImage: `
          radial-gradient(closest-side, transparent 98%, ${colors.tertiary} 100%), 
          radial-gradient(closest-side, transparent 98%, ${colors.tertiary} 100%)
        `,
        backgroundPosition: '0 0, 15px 15px',
        backgroundSize: '30px 30px'
      };
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
                 py-14 lg:py-20 xl:py-24
                 ${isPattern ? '' : '[background-size:175%] md:[background-size:cover]'}`}
      style={{ ...patternStyle, ...imageStyle }}
    >
      <div className="bg-white bg-opacity-50 rounded-md leading-none space-y-0 mx-auto
                      w-[200px] md:w-[300px] lg:w-[400px] py-3 md:py-4 lg:py-5">
        <p className={`tracking-tighter font-bold
                      ${showBreadcrumb ? 'text-[30px] md:text-[34px] lg:text-[38px] xl:text-[40px]' : 'text-[34px] md:text-[38px] lg:text-[40px] xl:text-[44px] py-1'}`}>
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
    <div className="relative overflow-hidden py-24 md:py-36 lg:py-48 xl:py-56">
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
      <div className="relative z-10 flex items-center justify-center text-center h-full">
        <div className="w-full bg-white bg-opacity-55 font-bold leading-none md:whitespace-nowrap
                        space-y-1 lg:space-y-2
                        p-2 md:p-3 lg:p-4">
          <p className="tracking-tighter text-[36px] md:text-[44px] lg:text-[54px] xl:text-[60px]">
            Graph & Language Intelligence Lab.
          </p>
          <p className="tracking-tighter text-[#888] text-[30px] md:text-[36px] lg:text-[42px] xl:text-[48px]">
            @ Konkuk Univ.
          </p>
        </div>
      </div>
    </div>
  )
}