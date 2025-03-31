# SkillShare Platform - Frontend Installation Guide

This document provides the necessary commands to install and set up the frontend of the SkillShare educational platform.

## Prerequisites

- Node.js (version 18.x or higher recommended)
- npm (version 9.x or higher recommended)

## Installation Steps

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install all dependencies:
```bash
npm install
```

## Manual Installation (If Something Goes Wrong)

If the automatic installation fails, you can install the packages manually:

### Core Dependencies
```bash
npm install next@15.2.2 react@19.0.0 react-dom@19.0.0
```

### UI and Components
```bash
npm install @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx lucide-react next-themes
```

### Form Handling and Validation
```bash
npm install @hookform/resolvers react-hook-form zod
```

### UI Libraries and Utilities
```bash
npm install embla-carousel-react tailwind-merge tailwindcss-animate
```

### Data Visualization
```bash
npm install recharts
```

### Image Upload and Management
```bash
npm install next-cloudinary
```

### Additional Utilities
```bash
npm install jspdf jspdf-autotable react-intersection-observer sonner
```

### Development Dependencies
```bash
npm install --save-dev @eslint/eslintrc @tailwindcss/forms @tailwindcss/postcss @types/node @types/react @types/react-dom autoprefixer eslint eslint-config-next postcss tailwindcss typescript
```

## Running the Application

After installing all dependencies, you can start the development server:

```bash
npm run dev
```

This will start the application on http://localhost:3030

## Build for Production

To build the application for production:

```bash
npm run build
```

Then to start the production server:

```bash
npm start
```

## Common Issues

### Peer Dependency Warnings
You might see some peer dependency warnings during installation. These are usually safe to ignore as long as the application runs correctly.

### Tailwind CSS Issues
If you encounter issues with Tailwind CSS, try running:

```bash
npx tailwindcss init -p
```

This will create or update the tailwind.config.js and postcss.config.js files.

### Module Not Found Errors
If you get "Module not found" errors, make sure all packages are installed and the import paths are correct. 