<template>
  <div class="workout-view">
    <h1>Workout View</h1>
    <div class="workout-details">
      <h2>{{ workout.name }}</h2>
      <p>{{ workout.description }}</p>
      <ul>
        <li v-for="(exercise, index) in workout.exercises" :key="index">
          {{ exercise.name }} - {{ exercise.reps }} reps
        </li>
      </ul>
    </div>
    <button @click="startWorkout">Start Workout</button>
  </div>
</template>

<script>
export default {
  name: "WorkoutView",
  data() {
    return {
      workout: {
        name: "Full Body Workout",
        description: "A great workout to target all muscle groups.",
        exercises: [
          { name: "Push-ups", reps: 15 },
          { name: "Squats", reps: 20 },
          { name: "Plank", reps: "1 min" },
        ],
      },
    };
  },
  methods: {
    startWorkout() {
      alert("Workout started!");
    },
  },
};
</script>

<style scoped>
.workout-view {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.workout-details {
  margin-bottom: 20px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #0056b3;
}
</style>
