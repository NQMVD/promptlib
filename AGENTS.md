# Agent Guidelines for promptlib

## Build/Lint/Test Commands
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
- No dedicated test/lint commands found

## Code Style Guidelines
- **TypeScript**: Not used (JavaScript/JSX)
- **Imports**: ES modules (`import/export` syntax)
- **Formatting**: No explicit formatter configured
- **Naming**: React components use PascalCase (e.g., `VariantsGallery.jsx`)
- **Error Handling**: Not explicitly defined
- **Framework**: React with Vite
- **Styling**: Tailwind CSS via PostCSS
- **State Management**: Not specified (likely local state)

## Project Structure
- `src/`: Main application code
- `public/`: Static assets
- Vite configuration with React plugin
- PNPM package manager

## Key Dependencies
- React 18
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS (styling)