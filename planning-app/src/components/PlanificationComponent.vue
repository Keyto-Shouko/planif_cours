<template>
  <div>
    <button @click="runPlanning">Run Planning</button>
  </div>
</template>

<script>
export default {
  props: ["worksheet"],
  methods: {
    async runPlanning() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/planification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ worksheet: this.worksheet }),
          }
        );
        const data = await response.json();
        this.$emit("planning-done", data.result);
      } catch (error) {
        console.error("Error running planning:", error);
      }
    },
  },
};
</script>
