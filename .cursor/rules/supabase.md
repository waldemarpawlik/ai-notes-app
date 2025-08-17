# Supabase Integration Rules

## Configuration
- Use environment variables for Supabase credentials
- Initialize Supabase client in lib/supabase.ts
- Use SSR-compatible Supabase client for server-side operations
- Use client-side Supabase for browser operations

## Authentication
- Implement auth state management with React context
- Use Supabase Auth UI components when possible
- Handle auth state changes properly
- Implement protected routes and components

## Database Operations
- Use TypeScript types for database schemas
- Implement proper error handling for all queries
- Use Row Level Security (RLS) for data protection
- Use real-time subscriptions for live updates when needed

## Best Practices
- Always handle loading and error states
- Use optimistic updates for better UX
- Implement proper data validation
- Use transactions for complex operations
- Cache data appropriately to reduce API calls
