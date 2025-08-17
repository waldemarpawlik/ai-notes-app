# Astro + React + TypeScript Rules

## General Guidelines
- Use TypeScript strict mode for all files
- Prefer functional components over class components
- Use Astro components for static content, React for interactive UI
- Import React hooks explicitly when needed
- Use TypeScript interfaces for props and data structures

## File Structure
- Place Astro pages in `src/pages/`
- Place React components in `src/components/`
- Place utilities in `src/utils/`
- Place types in `src/types/`
- Place library code in `src/lib/`

## Astro Specific
- Use `.astro` extension for Astro components
- Use frontmatter for server-side logic
- Use `client:*` directives for React hydration
- Prefer `client:load` for immediate interactivity
- Use `client:idle` for non-critical components

## React Specific
- Use `.tsx` extension for React components
- Use functional components with hooks
- Destructure props in component parameters
- Use proper TypeScript types for all props
- Export components as default

## Styling
- Use Tailwind CSS classes
- Create reusable utility classes when needed
- Use consistent spacing and typography
- Follow mobile-first responsive design

## Performance
- Keep bundle sizes minimal
- Use Astro's partial hydration
- Optimize images and assets
- Lazy load non-critical components
