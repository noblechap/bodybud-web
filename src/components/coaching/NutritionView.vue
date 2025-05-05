<template>
  <div class="nutrition-view">
    <h1>Nutrition View</h1>
    <p>Welcome to the Nutrition section. Track your meals and stay healthy!</p>

    <div class="meal-list">
      <h2>Today's Meals</h2>
      <ul>
        <li v-for="meal in meals" :key="meal.id">
          <strong>{{ meal.name }}</strong> - {{ meal.calories }} calories
        </li>
      </ul>
    </div>

    <div class="add-meal">
      <h2>Add a Meal</h2>
      <form @submit.prevent="addMeal">
        <input
          v-model="newMeal.name"
          type="text"
          placeholder="Meal Name"
          required
        />
        <input
          v-model.number="newMeal.calories"
          type="number"
          placeholder="Calories"
          required
        />
        <button type="submit">Add Meal</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "NutritionView",
  data() {
    return {
      meals: [
        { id: 1, name: "Breakfast", calories: 300 },
        { id: 2, name: "Lunch", calories: 600 },
      ],
      newMeal: {
        name: "",
        calories: null,
      },
    };
  },
  methods: {
    addMeal() {
      if (this.newMeal.name && this.newMeal.calories) {
        this.meals.push({
          id: this.meals.length + 1,
          ...this.newMeal,
        });
        this.newMeal.name = "";
        this.newMeal.calories = null;
      }
    },
  },
};
</script>

<style scoped>
.nutrition-view {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.meal-list ul {
  list-style-type: none;
  padding: 0;
}

.meal-list li {
  margin: 5px 0;
}

.add-meal form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
}
</style>
