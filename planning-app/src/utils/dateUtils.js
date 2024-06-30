// dateUtils.js
export function formatDateToFrench(dateString) {
  console.log(`formatDateToFrench called with: ${dateString}`);

  const [month, day, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);

  const options = { day: "numeric", month: "long", year: "numeric" };
  const frenchDate = new Intl.DateTimeFormat("fr-FR", options).format(date);

  console.log(`Formatted date: ${frenchDate}`);
  return frenchDate;
}
