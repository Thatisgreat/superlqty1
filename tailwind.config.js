//Rewrite default width\height\fontsize\padding\margin
//base html font-size = 16px

const defaultSize = new Array(100)
  .fill(0)
  .map((item, index) => (index + 1) * 16);

const size1 = [
  1, 3, 10, 11, 15, 17, 21, 26, 38, 44, 83, 86, 88, 114, 116, 134, 136, 164,
  166, 180, 190, 196, 232, 238, 248, 260, 292, 342, 344, 350, 372, 390, 456,
  508, 586, 594, 742, 836, 1000, 1074, 1300,
];
const size2 = [
  5, 7, 9, 13, 15, 58, 70, 72, 82, 122, 140, 144, 194, 288, 302, 364, 464, 516,
  520, 528, 600,
];

const size = [
  ...size1,
  ...size2,
  0,
  2,
  4,
  6,
  8,
  110,
  12,
  14,
  16,
  18,
  19,
  20,
  22,
  24,
  28,
  30,
  32,
  34,
  36,
  40,
  42,
  46,
  48,
  50,
  54,
  56,
  60,
  64,
  66,
  68,
  72,
  76,
  80,
  84,
  86,
  90,
  96,
  98,
  100,
  104,
  110,
  120,
  124,
  125,
  128,
  130,
  150,
  152,
  160,
  170,
  176,
  182,
  200,
  220,
  224,
  300,
  320,
  360,
  380,
  400,
  404,
  420,
  470,
  500,
  616,
  640,
  712,
  718,
  726,
  750,
  768,
  816,
  888,
  898,
  960,
  990,
  1024,
  1126,
  1150,
  1200,
  1276,
  1280,
  1536,
  1920,
];

//1-100 * 16
const customSize = {};

[...new Set([...size, ...defaultSize])].forEach((s) => {
  const key = s / 16;
  customSize[key] = `${key}rem`;
  customSize[`${s}px`] = `${s}px`;
});

//percent
const percents = [48, 52, 75];

percents.forEach((percent) => {
  customSize[String(`${percent}/100`)] = `${percent}%`;
});

//color
const baseColors = {
  primary: '#B4FF00',
  secondary: 'rgba(180, 255, 0, 0.20)',
  success: '#B4FF00',
  warning: '#FFE45C',
  error: '#FF5C5C',
  info: '#DDDDDD',
  white: '#ffffff',
  black: '#000000',
  lightBg: 'rgba(63, 65, 71, 0.71)',
  darkBg: '#0F0F0F',
  '#3F4147/80': 'rgba(63,65,71,0.8)',
  '#DDE1E7': '#DDE1E7',
  tabColor: 'rgba(180, 255, 0, 0.2)',
  inputColor: 'rgba(180, 255, 0, 0.5)',
};

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    backgroundColor: (theme) => ({
      ...theme('colors'),
      ...baseColors,
    }),
    textColor: (theme) => ({
      ...theme('colors'),
      ...baseColors,
    }),
    borderColor: (theme) => ({
      ...theme('colors'),
      ...baseColors,
    }),
    extend: {
      padding: customSize,
      margin: customSize,
      width: customSize,
      height: customSize,
      minWidth: customSize,
      maxWidth: customSize,
      minHeight: customSize,
      maxHeight: customSize,
      borderRadius: customSize,
      fontSize: customSize,
      inset: customSize,
      spacing: customSize,
      lineHeight: customSize,
    },
    screens: {
      xs: { max: '600px' },
      sm: { min: '600px', max: '900px' },
      md: { min: '900px', max: '1200px' },
      lg: { min: '1200px', max: '1536px' },
      xl: { min: '1536px' },
    },
  },
  extraPostCSSPlugins: ['tailwindcss', 'autoprefixer'],
  corePlugins: {
    preflight: false,
  },
  variants: {},
  plugins: [require('@tailwindcss/line-clamp')],
};
