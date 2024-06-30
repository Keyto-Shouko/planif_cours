<template>
  <div>
    <UploadComponent @file-uploaded="handleFileUploaded" />
    <button @click="runPlanning" class="turquoise-button">Run Planning</button>
    <RenderedTable v-if="planningResults.length" :modules="planningResults" />
  </div>
</template>

<script>
import UploadComponent from "./UploadComponent.vue";
import RenderedTable from "./RenderedTable.vue";

export default {
  components: {
    UploadComponent,
    RenderedTable,
  },
  data() {
    return {
      worksheet: [],
      planningResults: [],
    };
  },
  methods: {
    handleFileUploaded(worksheet) {
      console.log("PlanificationComponent - Received worksheet:", worksheet);
      this.worksheet = worksheet;
    },
    async runPlanning() {
      console.log("Run Planning button clicked");
      try {
        // Clear existing planning results
        this.planningResults = [];

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
        const result = data.result;

        console.log("Result from server:", result);

        this.planningResults = this.processPlanningResult(result);
      } catch (error) {
        console.error("Error running planning:", error);
      }
    },
    processPlanningResult(result) {
      return result.map((course) => ({
        name: course.name,
        dates: course.days, // Assuming `days` is an array of dates
        remainingHours: course.semester1Volume, // Assuming `semester1Volume` represents the remaining hours
      }));
    },
  },
};
</script>

<style scoped>
/* Button style */
.turquoise-button {
  background-color: #40e0d0;
  color: black;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
}

/* Table header style */
table th {
  background-color: #40e0d0;
  color: black;
  padding: 10px;
  text-align: left;
}

/* Table cell style (optional) */
table td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}
</style>
