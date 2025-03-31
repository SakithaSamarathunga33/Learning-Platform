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
    			'sky-blue': '#8ECAE6',
    			'ocean-blue': '#219EBC',
    			'deep-blue': '#023047',
    			'warning-yellow': '#FFB703',
    			'accent-orange': '#FB8500',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))', // Will be updated in globals.css
    				foreground: 'hsl(var(--primary-foreground))' // Will be updated in globals.css
    			},
    			secondary: {
    				'50': '#f8fafc', // Keep existing secondary for now, can adjust later if needed
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
    			blob: 'blob 7s infinite',
    			shake: 'shake 0.5s ease-in-out',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
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
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
		boxShadow: {
			soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
		},
		backgroundImage: {
			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			'hero-pattern': 'url("/background-pattern.svg")' // Fixed quotes
		},
		borderRadius: {
			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}, // Added missing comma here
    	}
    },
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      require("tailwindcss-animate"),
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      require("@tailwindcss/forms")
    ],
  }
