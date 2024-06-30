<!-- UploadComponent.vue -->
<template>
  <div>
    <input type="file" @change="handleFileUpload" />
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(
          workbook.Sheets[firstSheetName],
          { header: 1 }
        );

        this.$emit("file-uploaded", worksheet);
      };

      reader.readAsArrayBuffer(file);
    },
  },
};
</script>

<style scoped>
/* Input file style */
.turquoise-input {
  background-color: #40e0d0;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 4px;
}
</style>
