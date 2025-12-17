# Proxy Playfivers - Instruções de Deploy no Render

## 🚀 Passo a Passo para Deploy no Render

### 1. Criar repositório no GitHub
1. Crie um novo repositório no GitHub
2. Faça upload APENAS dos arquivos desta pasta (`render-proxy`):
   - `package.json`
   - `index.js`
   - `README.md` (opcional)

### 2. Criar Web Service no Render
1. Acesse https://render.com e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub

### 3. Configurações do Deploy

| Campo | Valor |
|-------|-------|
| **Name** | `playfivers-proxy` (ou qualquer nome) |
| **Region** | `Oregon (US West)` ou qualquer |
| **Branch** | `main` |
| **Root Directory** | *(deixe vazio se os arquivos estão na raiz)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 4. Clique em "Create Web Service"

O Render vai:
1. Instalar as dependências
2. Iniciar o servidor
3. Mostrar a URL do seu serviço (ex: `https://playfivers-proxy.onrender.com`)

### 5. Descobrir o IP Fixo
Após o deploy, acesse:
```
https://SEU-SERVICO.onrender.com/ip
```

Você verá algo como:
```json
{
  "ip": "XX.XX.XX.XX",
  "message": "Este é o IP que deve ser adicionado na whitelist da Playfivers"
}
```

**Adicione este IP na whitelist da Playfivers!**

---

## 🔧 Manter o Servidor Ativo 24/7 (Grátis)

O Render Free "dorme" após 15 min de inatividade. Para evitar:

### Opção 1: UptimeRobot (Recomendado)
1. Acesse https://uptimerobot.com (grátis)
2. Crie uma conta
3. Adicione um novo monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Playfivers Proxy
   - **URL**: `https://SEU-SERVICO.onrender.com/health`
   - **Monitoring Interval**: 5 minutes

### Opção 2: Cron-job.org
1. Acesse https://cron-job.org (grátis)
2. Crie um cron job para acessar sua URL a cada 5 minutos

---

## 📡 Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Status do servidor |
| `/health` | GET | Health check |
| `/ip` | GET | Mostra o IP fixo do servidor |
| `/proxy/playfivers` | POST | Proxy para API Playfivers |
| `/proxy` | POST | Proxy genérico |

---

## 🔗 Como Usar o Proxy

### Exemplo de chamada:
```javascript
const response = await fetch('https://SEU-SERVICO.onrender.com/proxy/playfivers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://api.playfivers.com/openGame',
    method: 'POST',
    body: {
      agentToken: 'seu-token',
      secretKey: 'sua-key',
      // ... outros parâmetros
    }
  })
});
```

---

## ⚠️ Importante

1. **IP Fixo**: O IP do Render é fixo por região. Anote o IP mostrado em `/ip` e adicione na Playfivers.

2. **Cold Start**: Na versão grátis, se o servidor dormir, a primeira request pode demorar ~30 segundos. Use UptimeRobot para evitar isso.

3. **Logs**: Você pode ver os logs no dashboard do Render para debug.
