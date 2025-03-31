/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				'50': '#f0f9ff',
    				'100': '#e0f2fe',
    				'200': '#bae6fd',
    				'300': '#7dd3fc',
    				'400': '#38bdf8',
    				'500': '#0ea5e9',
    				'600': '#0284c7',
    				'700': '#0369a1',
    				'800': '#075985',
    				'900': '#0c4a6e',
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				'50': '#f8fafc',
    				'100': '#f1f5f9',
    				'200': '#e2e8f0',
    				'300': '#cbd5e1',
    				'400': '#94a3b8',
    				'500': '#64748b',
    				'600': '#475569',
    				'700': '#334155',
    				'800': '#1e293b',
    				'900': '#0f172a',
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			accent: {
    				light: '#f9a8d4',
    				DEFAULT: 'hsl(var(--accent))',
    				dark: '#be185d',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			sans: [
    				'var(--font-sans)',
    				'sans-serif'
    			]
    		},
    		animation: {
    			'fade-in': 'fadeIn 0.6s ease-out forwards',
    			'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
    			'blob': 'blob 7s infinite',
    			'shake': 'shake 0.5s ease-in-out',
    		},
    		keyframes: {
    			fadeIn: {
    				'0%': {
    					opacity: '0'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			},
    			fadeInUp: {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			blob: {
    				'0%': {
    					transform: 'translate(0px, 0px) scale(1)'
    				},
    				'33%': {
    					transform: 'translate(30px, -50px) scale(1.1)'
    				},
    				'66%': {
    					transform: 'translate(-20px, 20px) scale(0.9)'
    				},
    				'100%': {
    					transform: 'translate(0px, 0px) scale(1)'
    				}
    			},
    			shake: {
    				'0%, 100%': {
    					transform: 'translateX(0)'
    				},
    				'25%': {
    					transform: 'translateX(-5px)'
    				},
    				'50%': {
    					transform: 'translateX(5px)'
    				},
    				'75%': {
    					transform: 'translateX(-5px)'
    				}
    			}
    		},
    		boxShadow: {
    			soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    			hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    		},
    		backgroundImage: {
    			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    			'hero-pattern': "url('/background-pattern.svg')"
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
    plugins: [
      require("tailwindcss-animate"),
      require("@tailwindcss/forms")
    ],
  }