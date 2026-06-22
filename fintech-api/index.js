const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// CONFIGURING CONNECTION TO THE LAGOS DATA ENCLAVE
const pool = new Pool({
  user: 'ledger_admin',
  password: 'HardenedPassword101!',
  database: 'domestic_transactions',
  host: '10.0.0.2', // <--- DIRECT WIREGUARD MESH IP OF YOUR LAPTOP
  port: 5432,       // <--- NATIVE POSTGRES PORT
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

// Serve the mobile simulator interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NairaPay Mobile</title>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <style>
            body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .phone { width: 360px; height: 640px; background: #fff; border-radius: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 8px solid #222; overflow: hidden; display: flex; flex-direction: column; }
            .header { background: #0066cc; color: #fff; padding: 20px; text-align: center; font-weight: bold; }
            .content { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 15px; }
            .balance-card { background: #e6f2ff; border-radius: 12px; padding: 20px; text-align: center; }
            .balance { font-size: 28px; font-weight: bold; color: #0066cc; margin-top: 5px; }
            input, button { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; box-sizing: border-box; font-size: 16px; }
            button { background: #00bb66; color: white; border: none; font-weight: bold; cursor: pointer; transition: 0.2s; }
            button:hover { background: #009955; }
            .status { text-align: center; font-size: 14px; font-weight: bold; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="phone">
            <div class="header">🇳🇬 NairaPay Mobile</div>
            <div class="content">
                <div class="balance-card">
                    <div>Available Balance</div>
                    <div class="balance">₦250,000.00</div>
                </div>
                <div style="margin-top: 20px;">
                    <label style="font-size:12px; color:#666;">Recipient User ID</label>
                    <input type="text" id="userId" value="user_lagos_05">
                </div>
                <div>
                    <label style="font-size:12px; color:#666;">Amount (NGN)</label>
                    <input type="number" id="amount" value="15000">
                </div>
                <button id="sendBtn" onclick="triggerPayment()">Send Funds Safely</button>
                <div id="statusReport" class="status"></div>
            </div>
        </div>

        <script>
            async function triggerPayment() {
                const btn = document.getElementById('sendBtn');
                const status = document.getElementById('statusReport');
                btn.disabled = true;
                btn.innerText = "Processing Transaction...";
                status.innerText = "";

                const payload = {
                    userId: document.getElementById('userId').value,
                    amount: parseFloat(document.getElementById('amount').value),
                    currency: "NGN",
                    reference: "TXN-" + Math.floor(Math.random() * 1000000)
                };

                try {
                    const response = await axios.post('/api/v1/payment', payload);
                    if(response.data.success) {
                        status.style.color = "#00bb66";
                        status.innerHTML = "💸 Success!<br><span style='font-size:11px; color:#555;'>Data Domiciled Securely in Nigeria (CBN Compliant)</span>";
                    }
                } catch (error) {
                    status.style.color = "#ff3333";
                    status.innerText = "Transaction Blocked: Data Residency link disrupted.";
                } finally {
                    btn.disabled = false;
                    btn.innerText = "Send Funds Safely";
                }
            }
        </script>
    </body>
    </html>
  `);
});

// 1. API to fetch all database records for the dashboard
app.get('/api/v1/admin/dashboard', async (req, res) => {
    try {
        const [totalTx, totalVolume, recentTx] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM tx_ledger'),
            pool.query('SELECT SUM(amount) FROM tx_ledger'),
            pool.query('SELECT * FROM tx_ledger ORDER BY processed_at DESC LIMIT 10')
        ]);
        res.json({
            success: true,
            totalCount: totalTx.rows[0].count,
            totalVolume: totalVolume.rows[0].sum || 0,
            transactions: recentTx.rows
        });
    } catch (error) {
        console.error("❌ DASHBOARD ERROR:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Visual Admin Interface Screen
app.get('/admin', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Control Tower</title>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <style>
            body { font-family: sans-serif; background: #0f172a; color: #f8fafc; margin: 40px; }
            .grid { display: flex; gap: 20px; margin: 20px 0; }
            .card { background: #1e293b; padding: 20px; border-radius: 8px; flex: 1; border: 1px solid #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #1e293b; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
            th { background: #334155; }
        </style>
    </head>
    <body>
        <h2>🇳🇬 Control Tower: Data Residency Engine</h2>
        <div class="grid">
            <div class="card"><h4>Total Rows</h4><h2 id="totalCount">0</h2></div>
            <div class="card"><h4>Total Volume</h4><h2 id="totalVolume">₦0.00</h2></div>
        </div>
        <h3>Live Audit Logs (PostgreSQL via WireGuard)</h3>
        <table>
            <thead><tr><th>Reference</th><th>User ID</th><th>Amount</th><th>Time</th></tr></thead>
            <tbody id="ledgerRows"></tbody>
        </table>
        <script>
            async function loadData() {
                try {
                    const res = await axios.get('/api/v1/admin/dashboard');
                    if (res.data.success) {
                        document.getElementById('totalCount').innerText = res.data.totalCount;
                        document.getElementById('totalVolume').innerText = "₦" + parseFloat(res.data.totalVolume).toLocaleString();
                        const tbody = document.getElementById('ledgerRows');
                        tbody.innerHTML = "";
                        res.data.transactions.forEach(tx => {
                            tbody.innerHTML += "<tr><td><code>" + tx.tx_ref + "</code></td><td>" + tx.user_id + "</td><td>₦" + parseFloat(tx.amount).toLocaleString() + "</td><td>" + new Date(tx.processed_at).toLocaleTimeString() + "</td></tr>";
                        });
                    }
                } catch (err) { console.error(err); }
            }
            setInterval(loadData, 3000);
            loadData();
        </script>
    </body>
    </html>
    `);
});

// Double check that your app listen statement is right here at the very bottom!
app.listen(3000, () => {
    console.log('Hybrid Core Engine Active on Port 3000');
});
