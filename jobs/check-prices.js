const apiUrl = process.env.PRICE_CHECK_API_URL;
const cronSecret = process.env.CRON_SECRET;
const localHour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Europe/Bucharest' }).format(new Date()));
const scheduledHours = [8, 13, 17];

if (!scheduledHours.includes(localHour)) {
  console.log(`Nu este ora unei verificari: ${localHour}:00 Europe/Bucharest.`);
  process.exit(0);
}

if (!apiUrl || !cronSecret) {
  console.error('PRICE_CHECK_API_URL si CRON_SECRET sunt obligatorii.');
  process.exit(1);
}

fetch(`${apiUrl.replace(/\/$/, '')}/api/jobs/check-prices`, {
  method: 'POST',
  headers: { 'x-cron-secret': cronSecret }
})
  .then(async (response) => {
    const body = await response.text();
    console.log(body);
    if (!response.ok) process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
