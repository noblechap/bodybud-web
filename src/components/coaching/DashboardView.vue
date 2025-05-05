<template>
  <div class="dashboard-view">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
    </header>
    <section class="dashboard-content">
      <div class="widget" v-for="widget in widgets" :key="widget.id">
        <h2>{{ widget.title }}</h2>
        <p>{{ widget.description }}</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "DashboardView",
  data() {
    return {
      widgets: [
        { id: 1, title: "Widget 1", description: "This is the first widget." },
        { id: 2, title: "Widget 2", description: "This is the second widget." },
        { id: 3, title: "Widget 3", description: "This is the third widget." },
      ],
    };
  },
};
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.widget {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
}
</style>
