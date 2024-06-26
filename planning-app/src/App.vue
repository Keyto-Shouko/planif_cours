<template>
  <div id="app">
    <UploadComponent @file-uploaded="handleFileUpload" />
    <PlanificationComponent
      v-if="worksheet"
      :worksheet="worksheet"
      @planning-done="handlePlanningDone"
    />
    <ResultComponent v-if="results.length" :results="results" />
  </div>
</template>

<script>
import UploadComponent from "./components/UploadComponent.vue";
import PlanificationComponent from "./components/PlanificationComponent.vue";
import ResultComponent from "./components/ResultComponent.vue";

export default {
  data() {
    return {
      worksheet: null,
      results: [],
    };
  },
  components: {
    UploadComponent,
    PlanificationComponent,
    ResultComponent,
  },
  methods: {
    handleFileUpload(worksheet) {
      this.worksheet = worksheet;
    },
    handlePlanningDone(results) {
      this.results = results;
    },
  },
};
</script>
