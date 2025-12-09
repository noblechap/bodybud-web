---
description: Pinia stores patterns and best practices
applyTo: "**/store/**/*"
---

# Pinia Stores in Nuxt 4

Pinia is the official state management solution for Vue 3. Stores in `src/store/` are auto-imported in Nuxt.

- Refer to https://pinia.vuejs.org/ for official documentation
- Use Pinia for GLOBAL application state, NOT for data fetching (use composables for that)
- Name stores with `use` prefix and `Store` suffix: `useUserStore`, `useCartStore`
- ALWAYS use the Setup Store syntax (Composition API style), NOT Options API
- Organize actions logically and keep them focused
- Use getters for computed state
- ALWAYS use TypeScript for type safety

## Examples

### Basic Setup Store

```typescript
// store/counter.ts
export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Counter')
  
  // Getters
  const doubleCount = computed(() => count.value * 2)
  
  // Actions
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = 0
  }
  
  return {
    // State
    count,
    name,
    // Getters
    doubleCount,
    // Actions
    increment,
    decrement,
    reset
  }
})
```

### Store with Persistence

```typescript
// store/preferences.ts
export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('en')
  const notifications = ref(true)
  
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }
  
  function setLanguage(lang: string) {
    language.value = lang
  }
  
  function toggleNotifications() {
    notifications.value = !notifications.value
  }
  
  return {
    theme,
    language,
    notifications,
    setTheme,
    setLanguage,
    toggleNotifications
  }
}, {
  persist: {
    storage: persistedState.localStorage,
  }
})
```

### Complex Store with TypeScript

```typescript
// store/cart.ts
import type { Product } from '~/types/models'

interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  
  // Getters
  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )
  
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  )
  
  // Actions
  function addItem(product: Product, quantity = 1) {
    const existingItem = items.value.find(item => item.product.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }
  }
  
  function removeItem(productId: string) {
    const index = items.value.findIndex(item => item.product.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }
  
  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity = quantity
    }
  }
  
  function clearCart() {
    items.value = []
  }
  
  return {
    // State
    items,
    // Getters
    totalItems,
    totalPrice,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
})
```

## Best Practices

- Use stores for cross-component state that needs to persist
- Keep store logic focused and single-purpose
- Use actions for any state mutations (don't modify state directly outside the store)
- Leverage getters for derived/computed state
- Document complex store logic with comments
- Use TypeScript interfaces for complex state shapes
- Consider using `storeToRefs()` when destructuring in components to maintain reactivity

