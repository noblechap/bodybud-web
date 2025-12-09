---
description: Nuxt 4 pages and routing patterns
applyTo: "**/pages/**/*"
---

---

# Routes and Page Components in Nuxt 4

Patterns for pages and routing in Nuxt.

`src/pages` folder contains the routes of the application using Nuxt's file-based routing (built on Vue Router). The routes are defined in a file-based manner, meaning that the structure of the files and folders directly corresponds to the routes of the application.

- Refer to https://nuxt.com/docs/guide/directory-structure/pages for up-to-date information
- `index.vue` files are acceptable in Nuxt and create the base route for a directory
- ALWAYS use explicit names for route params: prefer `userId` over `id`, `postSlug` over `slug`, etc.
- Use square brackets `[paramName]` for dynamic route parameters: `user/[id].vue` -> `/user/:id`
- Use double brackets `[[paramName]]` for optional route parameters: `posts/[[slug]].vue` matches both `/posts` and `/posts/my-post`
- Use `[...slug].vue` for catch-all routes (404 pages)
- Within a page component, use `definePageMeta()` to customize the route's properties like `layout`, `middleware`, `name`, `alias`, etc
- Use `useRoute()` to access route params and query: `const route = useRoute(); const id = route.params.id`
- Use `navigateTo()` for programmatic navigation: `navigateTo('/dashboard')` or `navigateTo({ name: 'user-id', params: { id: userId } })`
- Prefer `<NuxtLink>` for declarative navigation with automatic prefetching

## Page Logic Organization

**Use inline composables within pages when:**
- Logic is specific to this page only (filters, pagination, form state)
- Logic is simple and doesn't need to be tested separately
- The composable helps organize complex page logic into smaller, named functions

**Extract to `src/composables/` when:**
- Logic is shared across multiple pages
- Logic is complex and needs dedicated testing
- Logic handles API calls, shared state, or common patterns

**Example of good inline composable:**
```vue
<script setup lang="ts">
// ✅ Inline composable for page-specific table management
function useUserTable() {
  const page = ref(1)
  const itemsPerPage = ref(10)
  const sortBy = ref('name')
  
  const paginatedUsers = computed(() => {
    // Pagination logic specific to this page
  })
  
  return { page, itemsPerPage, sortBy, paginatedUsers }
}

const { page, itemsPerPage, sortBy, paginatedUsers } = useUserTable()
</script>
```

## Example

### Basic File Structure (Nuxt 4)

```
src/pages/
├── index.vue # Homepage at /
├── about.vue # About page at /about
├── dashboard.vue # Dashboard at /dashboard
├── [...slug].vue # Catch-all route for 404 pages
└── user/
    ├── index.vue # User list at /user
    └── [id].vue # User detail at /user/:id
```

### Nested Routes

Nuxt automatically creates nested routes when you have matching folder and file names:

```
src/pages/
├── parent.vue # Parent layout with <NuxtPage />
└── parent/
    ├── child1.vue # Renders at /parent/child1
    └── child2.vue # Renders at /parent/child2
```

### Dynamic Routes Examples

```
src/pages/
├── posts/
│   ├── [id].vue # /posts/123
│   └── [id]/
│       └── edit.vue # /posts/123/edit
└── blog/
    └── [[slug]].vue # Matches /blog AND /blog/my-post
```

Resulting URLs:

- `/posts/123` -> renders `src/pages/posts/[id].vue`
- `/posts/123/edit` -> renders `src/pages/posts/[id]/edit.vue`
- `/blog` or `/blog/my-post` -> renders `src/pages/blog/[[slug]].vue`
- `/profile` -> renders `src/pages/(user)/profile.vue`
- `/order` -> renders `src/pages/(user)/order.vue`

