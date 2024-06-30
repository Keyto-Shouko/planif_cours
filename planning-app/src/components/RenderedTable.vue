<template>
  <div>
    <h2>Planning Results</h2>
    <table>
      <thead>
        <tr>
          <th>Module</th>
          <th>Dates</th>
          <th>Volume Restant</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="module in modules" :key="module.name">
          <td>{{ module.name }}</td>
          <td>
            <ul>
              <li v-for="date in module.dates" :key="date">{{ date }}</li>
            </ul>
          </td>
          <td>{{ module.remainingHours }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ["modules"],
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #40e0d0;
}
ul {
  padding-left: 20px; /* Indent list */
  margin: 0;
}
li {
  list-style-type: none; /* Remove default bullet points */
}
</style>
