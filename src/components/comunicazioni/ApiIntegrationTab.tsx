import React, { useState } from 'react';
import { useCommunications } from '../../context/CommunicationsContext';
import {
  Code,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  MessageSquare,
  Send,
  Mail,
  Lock,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export const ApiIntegrationTab: React.FC = () => {
  const { apiConfig, updateApiConfig, copyToClipboard } = useCommunications();

  const [whatsappEnabled, setWhatsappEnabled] = useState(apiConfig.whatsappEnabled);
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState(
    apiConfig.whatsappPhoneNumberId
  );
  const [whatsappAccessToken, setWhatsappAccessToken] = useState(
    apiConfig.whatsappAccessToken
  );

  const [telegramEnabled, setTelegramEnabled] = useState(apiConfig.telegramEnabled);
  const [telegramBotToken, setTelegramBotToken] = useState(apiConfig.telegramBotToken);

  const [emailEnabled, setEmailEnabled] = useState(apiConfig.emailEnabled);
  const [smtpHost, setSmtpHost] = useState(apiConfig.smtpHost);
  const [smtpPort, setSmtpPort] = useState(apiConfig.smtpPort);
  const [smtpUser, setSmtpUser] = useState(apiConfig.smtpUser);

  const [webhookUrl, setWebhookUrl] = useState(apiConfig.webhookUrl);
  const [webhookSecret, setWebhookSecret] = useState(apiConfig.webhookSecret);

  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'nodejs' | 'webhook'>('curl');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateApiConfig({
      whatsappEnabled,
      whatsappPhoneNumberId,
      whatsappAccessToken,
      telegramEnabled,
      telegramBotToken,
      emailEnabled,
      smtpHost,
      smtpPort,
      smtpUser,
      webhookUrl,
      webhookSecret,
    });
  };

  const sampleCurlSnippet = `curl -X POST "${webhookUrl || 'https://api.gymmanager.com/v1/communications/send'}" \\
  -H "Authorization: Bearer ${whatsappAccessToken || 'YOUR_API_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "athleteId": "ath-1",
    "channel": "WhatsApp",
    "template": "pagamento_in_scadenza",
    "recipientPhone": "+393331234567",
    "parameters": {
      "nome_atleta": "Marco Rossi",
      "importo": "€ 120,00",
      "data_scadenza": "2026-08-15"
    }
  }'`;

  const sampleNodeSnippet = `import { CommunicationsSDK } from '@builder/gym-sdk';

const client = new CommunicationsSDK({
  whatsappPhoneNumberId: '${whatsappPhoneNumberId || '1098234591'}',
  whatsappAccessToken: '${whatsappAccessToken || 'EAAx823...'}'
});

await client.sendTemplateMessage({
  athleteId: 'ath-1',
  channel: 'WhatsApp',
  templateCategory: 'benvenuto',
  phone: '+393331234567',
  variables: {
    nome_atleta: 'Laura Bianchi',
    nome_palestra: 'Builder Athlete Club'
  }
});`;

  const sampleWebhookSnippet = `// Backend Webhook Handler (Express.js)
app.post('/v1/webhooks/communications', (req, res) => {
  const signature = req.headers['x-gym-signature'];
  const event = req.body;

  if (event.type === 'communication.status_updated') {
    console.log(\`Messaggio \${event.data.id} consegnato a \${event.data.athleteName}\`);
  }

  res.status(200).json({ received: true });
});`;

  const getCodeSnippet = () => {
    if (activeCodeTab === 'curl') return sampleCurlSnippet;
    if (activeCodeTab === 'nodejs') return sampleNodeSnippet;
    return sampleWebhookSnippet;
  };

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(getCodeSnippet());
    if (ok) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-300">
              Architettura Predisposta per Integrazioni API & Webhooks
            </p>
            <p className="text-amber-200/80 leading-relaxed">
              I messaggi vengono attualmente aperti direttamente nell'applicazione di destinazione (WhatsApp, Telegram, Client Mail) o copiati negli appunti.
            </p>
          </div>
        </div>
        <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Campi esclusivamente dimostrativi. Non inserire token, password o chiavi API reali: nella demo vengono salvati nel browser.
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Credentials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WhatsApp API Settings */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-zinc-100">
                  WhatsApp Business API (Meta Cloud)
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Phone Number ID (Meta App)
                </label>
                <input
                  type="text"
                  value={whatsappPhoneNumberId}
                  onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                  placeholder="Es. 1098234591028"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Permanent Access Token (Meta Graph API)
                </label>
                <input
                  type="password"
                  value={whatsappAccessToken}
                  onChange={(e) => setWhatsappAccessToken(e.target.value)}
                  placeholder="EAAx823..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Telegram Bot Settings */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                <h4 className="text-sm font-bold text-zinc-100">
                  Telegram Bot API
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Telegram Bot Token (da BotFather)
                </label>
                <input
                  type="password"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="Es. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Consente l'invio diretto tramite Bot t.me o notifiche di gruppo canale per lo staff.
              </p>
            </div>
          </div>

          {/* Email SMTP Settings */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-zinc-100">
                  Email SMTP / SendGrid Gateway
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gymmanager.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Porta
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  placeholder="587"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Webhook Dispatcher */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-zinc-100">
                  Global Webhook Dispatcher
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 rounded text-[10px] font-bold border border-indigo-800/40">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Webhook Endpoint URL
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.gymmanager.com/v1/webhooks"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  HMAC Secret Key (Signature Verification)
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Salva Configurazione API</span>
          </button>
        </div>
      </form>

      {/* Developer API & Webhook Playground Code Box */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-bold text-zinc-100">
              Specifica Integrazione API & Code Snippet
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex gap-1 text-xs">
              <button
                onClick={() => setActiveCodeTab('curl')}
                className={`px-3 py-1 rounded-lg font-mono font-semibold transition-colors ${
                  activeCodeTab === 'curl'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveCodeTab('nodejs')}
                className={`px-3 py-1 rounded-lg font-mono font-semibold transition-colors ${
                  activeCodeTab === 'nodejs'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Node.js SDK
              </button>
              <button
                onClick={() => setActiveCodeTab('webhook')}
                className={`px-3 py-1 rounded-lg font-mono font-semibold transition-colors ${
                  activeCodeTab === 'webhook'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Webhook Express
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors"
              title="Copia codice"
            >
              {copiedSnippet ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-amber-300 leading-relaxed overflow-x-auto">
          <code>{getCodeSnippet()}</code>
        </pre>
      </div>
    </div>
  );
};
