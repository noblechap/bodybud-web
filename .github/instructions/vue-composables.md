---
description: Nuxt 4 composables patterns and best practices
applyTo: "**/composables/**/*"
---

# Composables in Nuxt 4

Composables are auto-imported functions that encapsulate reusable logic using the Composition API. In Nuxt, any file in `src/composables/` is automatically imported.

- Refer to https://nuxt.com/docs/guide/directory-structure/composables for official documentation
- Name composables with `use` prefix: `useCounter`, `useAuth`, `useFetch`
- ALWAYS export composables as named exports, NOT default exports
- Organize API composables by resource: `composables/api/users/useUsersApi.ts`
- Use Nuxt's built-in composables: `useFetch`, `useAsyncData`, `useRuntimeConfig`, `useState`, etc.
- For shared state, prefer `useState()` over reactive variables
- ALWAYS use TypeScript for type safety in composables
- Keep composables pure and testable when possible

## When to Use Composables vs Inline Logic

**Extract to `src/composables/` when:**
- Logic is reused across multiple pages/components
- Logic is complex and needs testing
- Logic handles shared state or API calls
- Logic is a common pattern (auth, forms, pagination, etc.)

**Keep inline in page/component when:**
- Logic is specific to ONE page/component only
- Logic is simple (< 20 lines)
- Logic directly manipulates component-specific state
- Extracting would not improve readability or reusability

## Examples

### Simple Composable

```typescript
// composables/useCounter.ts
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count: readonly(count),
    increment,
    decrement
  }
}
```

### Inline Composable (Page-Specific Logic)

```vue
<script setup lang="ts">
// ✅ Good: Inline composable for page-specific logic
function usePageFilters() {
  const filters = ref({
    search: '',
    status: 'all',
    sortBy: 'date'
  })
  
  const hasActiveFilters = computed(() => 
    filters.value.search !== '' || filters.value.status !== 'all'
  )
  
  function resetFilters() {
    filters.value = {
      search: '',
      status: 'all',
      sortBy: 'date'
    }
  }
  
  return {
    filters,
    hasActiveFilters,
    resetFilters
  }
}

// Use the inline composable
const { filters, hasActiveFilters, resetFilters } = usePageFilters()

// Fetch data using the filters
const { data: users } = await useFetch('/api/users', {
  query: filters
})
</script>

<template>
  <div>
    <v-text-field v-model="filters.search" label="Search" />
    <v-select v-model="filters.status" :items="['all', 'active', 'inactive']" />
    <v-btn v-if="hasActiveFilters" @click="resetFilters">Reset</v-btn>
  </div>
</template>
```

### API Composable

```typescript
// composables/api/users/useUsersApi.ts
import type { User } from '~/types/models'

export function useUsersApi() {
  async function getUser(id: string): Promise<User> {
    const { data, error } = await useFetch<User>(`/api/users/${id}`)
    if (error.value) throw error.value
    return data.value!
  }
  
  async function updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await useFetch<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: userData
    })
    if (error.value) throw error.value
    return data.value!
  }
  
  return {
    getUser,
    updateUser
  }
}
```

### Shared State Composable

```typescript
// composables/useAuth.ts
export function useAuth() {
  // This state is shared across all components
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = computed(() => user.value !== null)
  
  async function login(email: string, password: string) {
    // Login logic
    user.value = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  }
  
  function logout() {
    user.value = null
  }
  
  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout
  }
}
```

## Best Practices

- Keep composables focused on a single responsibility
- Document complex composables with JSDoc comments
- Return readonly refs when consumers shouldn't modify the state
- Use proper TypeScript types for parameters and return values
- Avoid side effects in composable initialization when possible
- For data fetching, prefer Nuxt's `useFetch` or `useAsyncData` over manual fetch

