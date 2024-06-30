<template>
  <div id="app">
    <!-- Header section -->
    <header class="app-header">
      <div class="logo">
        <!-- Replace 'logo.png' with your actual logo file -->
        <img src="./assets/LOGO_MDS.png" alt="Company Logo" />
      </div>
    </header>

    <!-- Main content area -->
    <main class="app-main">
      <PlanificationComponent />
    </main>
  </div>
</template>

<script>
import PlanificationComponent from "./components/PlanificationComponent.vue";

export default {
  name: "App",
  components: {
    PlanificationComponent,
  },
};
</script>

<style>
/* Global styles */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* Header styles */
.app-header {
  background-color: #ffffed; /* Example header background color (gray/white) */
  color: white;
  padding: 10px 0;
  text-align: center;
}

.app-header .logo {
  max-width: 200px; /* Adjust logo size as needed */
  margin: 0 auto; /* Center the logo horizontally */
}

.app-header .logo img {
  max-width: 100%;
  height: auto;
}

/* Main content styles */
.app-main {
  padding: 20px;
}
</style>
