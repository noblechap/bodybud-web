# BodyBud Web Application

A modern fitness tracking web application built with Nuxt 4, Vuetify 3, and TypeScript for managing workouts, nutrition, and fitness goals.

## Standards

MUST FOLLOW THESE RULES, NO EXCEPTIONS

- Stack: Nuxt 4, Vue 3, TypeScript, Vuetify 3, Pinia, i18n
- Patterns: ALWAYS use Composition API + `<script setup>`, NEVER use Options API
- ALWAYS Keep types alongside your code, use TypeScript for type safety, prefer `interface` over `type` for defining types
- Keep unit and integration tests alongside the file they test: `src/components/UserCard.vue` + `src/components/UserCard.spec.ts`
- ALWAYS use Vuetify components for UI elements (buttons, inputs, cards, etc.)
- Use Vuetify's theming system for colors, spacing, and typography
- DO NOT hard code colors or spacing values, use Vuetify's design tokens
- ONLY add meaningful comments that explain why something is done, not what it does
- Dev server is already running on `http://localhost:3000` with HMR enabled. NEVER launch it yourself
- ALWAYS use named functions when declaring methods, use arrow functions only for callbacks
- ALWAYS prefer named exports over default exports
- Follow Nuxt 4 auto-import conventions (composables, components, utils)

## Project Structure

Keep this section up to date with the project structure. Use it as a reference to find files and directories.

EXAMPLES are there to illustrate the structure, not to be implemented as-is.

```
public/ # Public static files (favicon, robots.txt, etc.)
src/
├── assets/ # Static assets processed by Vite
│   └── css/
│       └── main.scss # Global SCSS styles
├── components/ # Auto-imported reusable Vue components
│   └── ui/ # EXAMPLE: Base UI components
├── composables/ # Auto-imported composables
│   └── api/ # API composables organized by resource
│       └── users/
│           └── useUsersApi.ts # EXAMPLE: User API functions
├── fake/ # Mock data for development
│   └── fakeUser.ts # EXAMPLE: Fake user data
├── layouts/ # Nuxt layouts
│   └── default.vue # Default layout wrapper
├── middleware/ # Nuxt middleware for route guards
├── pages/ # File-based routing (auto-imported)
│   ├── index.vue # Homepage at /
│   ├── dashboard.vue # Dashboard at /dashboard
│   └── user/
│       └── [id].vue # Dynamic user page at /user/:id
├── plugins/ # Nuxt plugins
│   ├── api.ts # API configuration
│   └── vuetify.ts # Vuetify configuration
├── store/ # Pinia stores for global state
├── types/ # TypeScript type definitions
│   └── models.ts # Shared data models
└── app.vue # Root Vue component
```

## Project Commands

Frequently used commands:

- `pnpm dev`: starts the development server (already running)
- `pnpm build`: bundles the project for production
- `pnpm generate`: generates static site
- `pnpm preview`: previews the production build
- `pnpm lint`: lints the codebase with ESLint
- `pnpm lint:fix`: auto-fixes ESLint errors

## Development Workflow

ALWAYS follow the workflow when implementing a new feature or fixing a bug. This ensures consistency, quality, and maintainability of the codebase.

1. Plan your tasks, review them with user. Include tests when possible
2. Write code, following the [project structure](#project-structure) and [conventions](#standards)
3. **ALWAYS test implementations work**:
   - Verify in the browser that changes work as expected
   - Write tests for critical logic and components
   - Use browser dev tools to check for errors or warnings
4. Run `pnpm lint:fix` to ensure code quality
5. Stage your changes with `git add` once a feature works
6. Review changes and analyze the need of refactoring

## Nuxt 4 Conventions

- **Auto-imports**: Components, composables, and utils in their respective folders are auto-imported
- **File-based routing**: Pages in `src/pages/` automatically create routes
- **Layouts**: Use `<NuxtLayout>` and `<NuxtPage>` for layout and page rendering
- **Server routes**: API routes go in `server/api/` directory (not yet created)
- **Assets**: Images and styles in `src/assets/` are processed by Vite
- **Public**: Static files in `public/` are served as-is

## Vuetify 3 Guidelines

- ALWAYS use Vuetify components: `<v-btn>`, `<v-card>`, `<v-text-field>`, etc.
- Use Vuetify's grid system: `<v-container>`, `<v-row>`, `<v-col>`
- Apply Vuetify's utility classes for spacing: `ma-4`, `pa-2`, etc.
- Use Vuetify icons with MDI: `<v-icon>mdi-account</v-icon>`
- Access theme colors with `bg-primary`, `text-secondary`, etc.
- Use Vuetify's composables: `useTheme()`, `useDisplay()`, `useLocale()`

## Research & Documentation

- **NEVER hallucinate or guess URLs**
- For Nuxt 4: Refer to https://nuxt.com/docs
- For Vuetify 3: Refer to https://vuetifyjs.com/
- For Pinia: Refer to https://pinia.vuejs.org/
- For Vue 3: Refer to https://vuejs.org/
- ALWAYS verify examples and patterns from documentation before using

## Type Safety

- Use TypeScript for all files
- Define proper interfaces for API responses in `src/types/`
- Type composable return values explicitly
- Use Nuxt's auto-generated types from `.nuxt/`
