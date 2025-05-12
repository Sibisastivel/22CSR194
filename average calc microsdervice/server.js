const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMxMzE4LCJpYXQiOjE3NDcwMzEwMTgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijg2OWI5ODU1LTc2MjktNDg1OC1iYzkzLWYyODk0ZTc2ZGQ2ZSIsInN1YiI6InNpYmlzYXN0aXZlbHYuMjJjc2VAa29uZ3UuZWR1In0sImVtYWlsIjoic2liaXNhc3RpdmVsdi4yMmNzZUBrb25ndS5lZHUiLCJuYW1lIjoic2liaXNhc3RpdmVsIHYiLCJyb2xsTm8iOiIyMmNzcjE5NCIsImFjY2Vzc0NvZGUiOiJqbXBaYUYiLCJjbGllbnRJRCI6Ijg2OWI5ODU1LTc2MjktNDg1OC1iYzkzLWYyODk0ZTc2ZGQ2ZSIsImNsaWVudFNlY3JldCI6IkZ0V2pNTlhockpEWXZldVcifQ.U8nC_OSE_ZkmQU3PFnarPo2c2c78rEhFNov2mgqlF3U';
const baseURL = 'http://20.244.56.144/evaluation-service';
const numberApiMap = {
  p: `${baseURL}/primes`,
  f: `${baseURL}/fibo`,
  e: `${baseURL}/even`,
  r: `${baseURL}/rand`,
};
let slidingWindow = [];
function calculateAverage(arr) {
  if (arr.length === 0) return 0.0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(2));
}
app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;


  if (!numberApiMap[numberId]) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }
  const apiURL = numberApiMap[numberId];
  const prevWindow = [...slidingWindow];
  let fetchedNumbers = [];
  try {
    const response = await axios.get(apiURL, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`
      },
      timeout: TIMEOUT_MS
    });
    fetchedNumbers = response.data.numbers || [];
  } catch (err) {
    console.error('Fetch failed or timed out:', err.message);
    return res.json({
      windowPrevState: prevWindow,
      windowCurrState: slidingWindow,
      numbers: [],
      avg: calculateAverage(slidingWindow)
    });
  }
  for (const num of fetchedNumbers) {
    if (!slidingWindow.includes(num)) {
      if (slidingWindow.length >= WINDOW_SIZE) {
        slidingWindow.shift(); // remove oldest
      }
      slidingWindow.push(num);
    }
  }
  res.json({
    windowPrevState: prevWindow,
    windowCurrState: slidingWindow,
    numbers: fetchedNumbers,
    avg: calculateAverage(slidingWindow)
  });
});
app.listen(PORT, () => {
  console.log(`Average Calculator microservice is running on http://localhost:${PORT}`);
});
