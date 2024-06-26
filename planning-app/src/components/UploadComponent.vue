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

        // Log the content of the worksheet to the console
        console.log("Worksheet content:", worksheet);

        this.$emit("file-uploaded", worksheet);
      };

      reader.readAsArrayBuffer(file);
    },
  },
};
</script>
