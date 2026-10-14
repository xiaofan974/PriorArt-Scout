export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas: '#FAFAF8',
        subtle: '#F3F2EE',
        ink: {
          DEFAULT: '#17212B',
          2: '#3D4853',
          3: '#6B7480',
          4: '#A3A9B0',
        },
        line: {
          DEFAULT: '#E7E5E0',
          strong: '#D6D3CC',
        },
        accent: {
          DEFAULT: '#0F766E',
          hover: '#0B5F58',
          soft: '#E7F2F0',
          ink: '#0B4F4A',
        },
        partial: {
          DEFAULT: '#9A5A06',
          soft: '#FBF2E1',
          line: '#EBD3A6',
        },
      },
    },
  },
};
