const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        // "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        'main-image': "url('/main1.jpg')"
      },
      // backgroundImage: {
      //   "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      //   "gradient-conic":
      //     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      // },

      ////////////////////////////////////////////
      // 애니메이션 정의
      ////////////////////////////////////////////
      keyframes: {
        slide: {
          '0%, 100%': { 'background-image': 'url("/cover/main1-min.webp")' },
          '25%': { 'background-image': 'url("/cover/main2.webp")' },
          '50%': { 'background-image': 'url("/cover/main3.webp")' },
          '75%': { 'background-image': 'url("/cover/main4-3.webp")' }
        },
        fadeUp: {
          '0%': {opacity: '0', transform: 'translateY(10px)'},
          '100%': {opacity: '1', transform: 'translateY(0)'},
        },
        flipDown: {
          '0%': {
            transform: 'rotateX(-90deg)',
            opacity: 0,
          },
          '100%': {
            transform: 'rotateX(0deg)',
            opacity: 1,
          },
        },
        dropIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slider': 'slide 40s infinite linear',
        'fade-up': 'fadeUp 0.5s ease-out',
        'flip-down': 'flipDown 1s ease-out forwards',
        'drop-in': 'dropIn 0.5s ease-out forwards',
        'drop-in-25': 'dropIn 0.25s ease-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config