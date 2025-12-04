import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Min app' });
});

//loadtest-endpoint (CPU-tung beregning) lav evt ny fil til test???
router.get("/api/loadtest/:n", (req, res) => {
  let n = parseInt(req.params.n);
  let count = 0;

  if (n > 500000000) n = 500000000;

  for (let i = 0; i <= n; i++) {
    count += i;
  }

  res.send(`Final count is ${count} and check the response time in the header X-Response-Time`);
});

export default router;
