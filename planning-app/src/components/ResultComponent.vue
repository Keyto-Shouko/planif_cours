<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Intitulé du cours</th>
          <th>Volume horaire 1er semestre</th>
          <th>Volume horaire 2nd semestre</th>
          <th>Contraintes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in results" :key="index">
          <td>{{ row[0] }}</td>
          <td>{{ row[1] }}</td>
          <td>{{ row[2] }}</td>
          <td>{{ row[3] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: ["results"],
};
</script>
