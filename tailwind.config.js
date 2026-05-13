/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#FDF8EC',
                    100: '#FAF0CC',
                    300: '#E8C84A',
                    500: '#C9960C',
                    700: '#9A6E04',
                    900: '#5C3D00',
                    DEFAULT: '#C9960C',
                },
                secondary: {
                    50: '#E6EDF5',
                    100: '#B3C9E0',
                    300: '#4D85B8',
                    500: '#003366',
                    700: '#002347',
                    900: '#001229',
                    DEFAULT: '#003366',
                },
            },
        },
    },
    plugins: [],
}
