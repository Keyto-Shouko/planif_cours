<template>
  <div>
    <UploadComponent @file-uploaded="handleFileUploaded" />
    <button @click="runPlanning">Run Planning</button>
    <a v-if="planningResults.length" :href="downloadUrl" download="result.csv">
      Download Result
    </a>
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
      downloadUrl: 'http://localhost:3000/download' // URL to download the CSV file
    };
  },
  methods: {
    handleFileUploaded(worksheet) {
      this.worksheet = worksheet;
    },
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
        const result = data.result;

        this.planningResults = this.processPlanningResult(result);
      } catch (error) {
        console.error("Error running planning:", error);
      }
    },
    processPlanningResult(result) {
      return result.map((course) => ({
        name: course.name,
        dates: course.days,
        remainingHours: course.semester1Volume,
      }));
    },
  },
};
</script>

<style scoped>
button {
  background-color: #40e0d0;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

a {
  display: inline-block;
  margin-top: 10px;
  color: #40e0d0;
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid #40e0d0;
  border-radius: 5px;
}

a:hover {
  background-color: #40e0d0;
  color: white;
}
</style>
