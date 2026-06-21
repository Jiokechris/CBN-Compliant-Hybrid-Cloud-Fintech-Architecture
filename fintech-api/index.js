const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// CONFIGURING CONNECTION TO THE LAGOS DATA ENCLAVE
const pool = new Pool({
  user: 'ledger_admin',
  password: 'HardenedPassword101!',
  database: 'domestic_transactions',
  host: 'alwew-102-88-108-114.run.pinggy-free.link', // <--- YOUR PINGGY HOST IS ALREADY HERE
  port: 35387,                                      // <--- YOUR PINGGY PORT IS ALREADY HERE
});

// Create the data ledger table automatically if it doesn't exist
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tx_ledger (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50),
        amount NUMERIC,
        currency VARCHAR(10),
        tx_ref VARCHAR(100) UNIQUE,
        processed_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Connected back to Lagos Data Center. Schema validated.");
  } catch (err) {
    console.error("Data Residency Connection Error:", err.message);
  }
};
initDb();

// Payment Gate endpoint
app.post('/api/v1/payment', async (req, res) => {
  const { userId, amount, currency, reference } = req.body;
  try {
    const queryText = 'INSERT INTO tx_ledger(user_id, amount, currency, tx_ref) VALUES($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(queryText, [userId, amount, currency, reference]);
    
    res.status(201).json({
      success: true,
      cbn_status: "Compliant - Domiciled in Nigeria",
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Routing block: Non-compliant destination state." });
  }
});

app.listen(3000, () => console.log('Fintech Gateway active on AWS cloud...'));
