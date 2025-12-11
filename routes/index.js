import express from "express";
const router = express.Router();


// Forside GET
// Renderer landing page / hjemmeside
router.get('/', (req, res) => {
  res.render('index', { title: 'Understory Social' });
});



//LOADTEST
// API der udfører en CPU-tung beregning for at simulere høj server-load
// bruges til test af performance og loadbalancing
router.get("/api/loadtest/:n", (req, res) => {
  let n = parseInt(req.params.n);
  let count = 0;

  // sikkerhedsbegrænsning så serveren ikke fryser
  if (n > 500000000) n = 500000000;

  // simpel CPU-bound løkke der summerer tal op til n
  // dette blokkerer event loop’et og viser hvordan Node håndterer tung beregning
  for (let i = 0; i <= n; i++) {
    count += i;
  }

  // svar og info om responstid (X-Response-Time fra middleware)
  res.send(`Final count is ${count} and check the response time in the header X-Response-Time`);
});



export default router;
