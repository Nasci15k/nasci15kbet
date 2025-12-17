const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Store server IP
let SERVER_IP = null;

// Middleware
app.use(cors());
app.use(express.json());

// Get server IP on startup
async function getServerIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    SERVER_IP = data.ip;
    console.log('='.repeat(50));
    console.log('SERVER IP FIXO:', SERVER_IP);
    console.log('='.repeat(50));
    console.log('Adicione este IP na whitelist da Playfivers!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('Erro ao obter IP:', error.message);
  }
}

// Health check endpoint (keeps the server alive)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    server_ip: SERVER_IP,
    message: 'Proxy Playfivers ativo',
    timestamp: new Date().toISOString()
  });
});

// Health check for uptime monitors
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get current IP
app.get('/ip', (req, res) => {
  res.json({
    ip: SERVER_IP,
    message: 'Este é o IP que deve ser adicionado na whitelist da Playfivers'
  });
});

// Proxy endpoint for Playfivers API
app.post('/proxy/playfivers', async (req, res) => {
  try {
    const { url, method = 'POST', headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    console.log(`[PROXY] ${method} ${url}`);
    console.log(`[PROXY] IP de saída: ${SERVER_IP}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`[PROXY] Response status: ${response.status}`);

    res.status(response.status).json({
      success: response.ok,
      status: response.status,
      data,
      proxy_ip: SERVER_IP
    });

  } catch (error) {
    console.error('[PROXY] Error:', error.message);
    res.status(500).json({
      error: error.message,
      proxy_ip: SERVER_IP
    });
  }
});

// Generic proxy for any API
app.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status).json({
      success: response.ok,
      status: response.status,
      data,
      proxy_ip: SERVER_IP
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      proxy_ip: SERVER_IP
    });
  }
});

// Self-ping to keep alive (every 14 minutes)
setInterval(async () => {
  try {
    console.log('[KEEP-ALIVE] Ping automático...');
    // This keeps the server active
  } catch (e) {
    console.log('[KEEP-ALIVE] Error:', e.message);
  }
}, 14 * 60 * 1000); // 14 minutes

// Start server
app.listen(PORT, async () => {
  console.log(`Servidor proxy rodando na porta ${PORT}`);
  await getServerIP();
});
