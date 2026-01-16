'use client';

import { useState, useEffect } from 'react';
import { settingsAPI, popupAPI } from '@/lib/api';

export default function AdminSettingsPage() {
  const [supportTelegram, setSupportTelegram] = useState('');
  const [telegramSupportLink, setTelegramSupportLink] = useState('');
  const [btcWalletAddress, setBtcWalletAddress] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'pushinpay' | 'syncpay'>('pushinpay');
  const [blackFridayPromo, setBlackFridayPromo] = useState(false);
  const [forcedPurchase, setForcedPurchase] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Popup states
  const [popupMessage, setPopupMessage] = useState('');
  const [popupButtonText, setPopupButtonText] = useState('');
  const [popupButtonLink, setPopupButtonLink] = useState('');
  const [popupIsActive, setPopupIsActive] = useState(true);
  const [savingPopup, setSavingPopup] = useState(false);
  const [popupStatusMessage, setPopupStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchPopupConfig();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsAPI.getPublicSettings();
      setSupportTelegram(data.supportTelegram || '');
      setTelegramSupportLink(data.telegramSupportLink || '');
      setBtcWalletAddress(data.btcWalletAddress || '');
      setPaymentGateway(data.paymentGateway || 'pushinpay');
      setBlackFridayPromo(data.blackFridayPromo || false);
      setForcedPurchase(data.forcedPurchase || false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPopupConfig = async () => {
    try {
      const data = await popupAPI.getConfig();
      if (data.popup) {
        setPopupMessage(data.popup.message);
        setPopupButtonText(data.popup.buttonText);
        setPopupButtonLink(data.popup.buttonLink);
        setPopupIsActive(data.popup.isActive);
      }
    } catch (error) {
      console.error('Failed to load popup config:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await settingsAPI.updateSetting('support_telegram', supportTelegram);
      await settingsAPI.updateSetting('telegram_support_link', telegramSupportLink);
      await settingsAPI.updateSetting('btc_wallet_address', btcWalletAddress);
      await settingsAPI.updateSetting('payment_gateway', paymentGateway);
      await settingsAPI.updateSetting('black_friday_promo', blackFridayPromo.toString());
      await settingsAPI.updateSetting('forced_purchase', forcedPurchase.toString());
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPopup(true);
    setPopupStatusMessage(null);

    try {
      await popupAPI.saveConfig({
        message: popupMessage,
        buttonText: popupButtonText,
        buttonLink: popupButtonLink,
        isActive: popupIsActive,
      });
      setPopupStatusMessage({ type: 'success', text: 'Popup configuration saved successfully!' });
    } catch (error: any) {
      console.error('Failed to save popup config:', error);
      setPopupStatusMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save popup configuration'
      });
    } finally {
      setSavingPopup(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-accent-gold mb-8">
          Settings
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === 'success'
                ? 'bg-green-900/50 text-green-200 border border-green-700'
                : 'bg-red-900/50 text-red-200 border border-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="card-noir">
          <h2 className="text-2xl font-bold text-accent-purple mb-6">
            Contact Information
          </h2>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Support Telegram Link
            </label>
            <input
              type="url"
              value={supportTelegram}
              onChange={(e) => setSupportTelegram(e.target.value)}
              placeholder="https://t.me/yoursupport"
              className="input-noir w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              This link will be displayed in the footer for users to conta
              ct support.
              <br />
              Example: https://t.me/yourusername or https://t.me/+yourgroup
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Payment Gateway
            </label>
            <select
              value={paymentGateway}
              onChange={(e) => setPaymentGateway(e.target.value as 'pushinpay' | 'syncpay')}
              className="input-noir w-full"
            >
              <option value="pushinpay">PushinPay</option>
              <option value="syncpay">SyncPay</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Select which payment gateway to use for PIX payments. This affects all new payments.
              <br />
              <span className="text-yellow-500">Working.</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Bitcoin Settings Section */}
        <form onSubmit={handleSave} className="card-noir mt-8">
          <h2 className="text-2xl font-bold text-accent-gold mb-6 flex items-center gap-2">
            <span>💰</span>
            Bitcoin Payment Settings
          </h2>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Telegram Support Link (for Bitcoin payments)
            </label>
            <input
              type="url"
              value={telegramSupportLink}
              onChange={(e) => setTelegramSupportLink(e.target.value)}
              placeholder="https://t.me/yoursupport"
              className="input-noir w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              Link where customers should send payment proof for Bitcoin transactions.
              <br />
              Example: https://t.me/yourusername
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Bitcoin Wallet Address
            </label>
            <input
              type="text"
              value={btcWalletAddress}
              onChange={(e) => setBtcWalletAddress(e.target.value)}
              placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              className="input-noir w-full font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-2">
              Your Bitcoin wallet address for receiving international payments.
              <br />
              <span className="text-yellow-500">⚠️ Important: Make sure this is a valid Bitcoin address.</span>
              <br />
              For better privacy, consider using an HD wallet XPUB to generate unique addresses (requires additional setup).
            </p>
          </div>

          <div className="p-4 bg-noir-dark rounded-lg border border-accent-gold/30 mb-6">
            <h3 className="text-sm font-bold text-accent-gold mb-2">How Bitcoin Payments Work</h3>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>International customers can pay with Bitcoin</li>
              <li>System calculates USD → BTC conversion + 3% fee</li>
              <li>Customer sends payment to your wallet address</li>
              <li>Customer sends proof via Telegram link above</li>
              <li>You manually confirm payments in the Bitcoin Payments admin page</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent-gold to-yellow-600 hover:from-yellow-600 hover:to-accent-gold"
          >
            {saving ? 'Saving...' : 'Save Bitcoin Settings'}
          </button>
        </form>

        {/* Black Friday Promotion Section */}
        <form onSubmit={handleSave} className="card-noir mt-8">
          <h2 className="text-2xl font-bold text-accent-rose mb-6 flex items-center gap-2">
            <span>🔥</span>
            Black Friday Promotion
          </h2>

          <div className="mb-6 p-6 bg-gradient-to-r from-accent-rose/10 to-accent-purple/10 rounded-lg border border-accent-gold/30">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blackFridayPromo}
                    onChange={(e) => setBlackFridayPromo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-noir-dark peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent-rose peer-checked:to-accent-purple"></div>
                </label>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-accent-gold mb-2">
                  {blackFridayPromo ? '✅ Promoção Ativa' : 'Ativar Promoção Black Friday'}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {blackFridayPromo
                    ? 'A promoção de Black Friday está ativa. Os clientes verão:'
                    : 'Ative a promoção para mostrar os seguintes elementos aos clientes:'}
                </p>
                <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                  <li>Popup de anúncio na primeira visita à loja</li>
                  <li>Banner de promoção no topo da página da loja</li>
                  <li>Badge de "-10%" nos cards de produtos</li>
                  <li>Indicação visual de desconto nas páginas de produtos</li>
                </ul>
                <div className="mt-4 p-3 bg-noir-dark rounded border border-accent-gold/50">
                  <p className="text-xs text-gray-400">
                    <strong className="text-accent-gold">Nota:</strong> Esta opção apenas controla a exibição visual da promoção.
                    Os preços devem ser ajustados manualmente na seção de produtos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent-rose to-accent-purple hover:from-accent-purple hover:to-accent-rose"
          >
            {saving ? 'Saving...' : 'Save Promotion Settings'}
          </button>
        </form>

        {/* Forced Purchase Section */}
        <form onSubmit={handleSave} className="card-noir mt-8">
          <h2 className="text-2xl font-bold text-accent-gold mb-6 flex items-center gap-2">
            <span>🎁</span>
            Compra Forçada (Teste/Produtos Gratuitos)
          </h2>

          <div className="mb-6 p-6 bg-gradient-to-r from-accent-gold/10 to-accent-purple/10 rounded-lg border border-accent-gold/30">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forcedPurchase}
                    onChange={(e) => setForcedPurchase(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-noir-dark peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent-gold peer-checked:to-accent-purple"></div>
                </label>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-accent-gold mb-2">
                  {forcedPurchase ? '✅ Compra Forçada Ativa' : 'Ativar Compra Forçada'}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {forcedPurchase
                    ? 'A compra forçada está ativa. Os clientes verão:'
                    : 'Ative a compra forçada para permitir que os clientes resgatem produtos gratuitamente:'}
                </p>
                <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                  <li>Botão com texto "Resgatar meu pedido" em vez de "Verificar"</li>
                  <li>Ao clicar 3 vezes no botão, o produto é liberado automaticamente</li>
                  <li>Funciona mesmo sem pagamento efetivo</li>
                  <li>Útil para testes, promoções gratuitas ou distribuição de conteúdo</li>
                </ul>
                <div className="mt-4 p-3 bg-noir-dark rounded border border-red-500/50">
                  <p className="text-xs text-red-300">
                    <strong className="text-red-400">⚠️ ATENÇÃO:</strong> Esta opção permite que qualquer pessoa receba produtos sem pagar.
                    Use apenas para testes ou quando quiser distribuir produtos gratuitamente.
                    Desative em ambiente de produção se estiver vendendo produtos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent-gold to-accent-purple hover:from-accent-purple hover:to-accent-gold"
          >
            {saving ? 'Saving...' : 'Save Forced Purchase Settings'}
          </button>
        </form>

        {/* Popup Configuration Section */}
        <form onSubmit={handleSavePopup} className="card-noir mt-8">
          <h2 className="text-2xl font-bold text-accent-purple mb-6">
            Popup Configuration
          </h2>

          {popupStatusMessage && (
            <div
              className={`mb-6 p-4 rounded ${
                popupStatusMessage.type === 'success'
                  ? 'bg-green-900/50 text-green-200 border border-green-700'
                  : 'bg-red-900/50 text-red-200 border border-red-700'
              }`}
            >
              {popupStatusMessage.text}
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={popupIsActive}
                onChange={(e) => setPopupIsActive(e.target.checked)}
                className="mr-3 h-5 w-5 rounded border-gray-600 bg-dark-lighter text-accent-gold focus:ring-accent-gold focus:ring-offset-0"
              />
              <span className="text-gray-300 font-medium">Enable Popup</span>
            </label>
            <p className="text-sm text-gray-500 mt-2 ml-8">
              When enabled, the popup will be shown to users when they visit the site
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Popup Message
            </label>
            <textarea
              value={popupMessage}
              onChange={(e) => setPopupMessage(e.target.value)}
              placeholder="Enter the message to display in the popup"
              rows={4}
              className="input-noir w-full resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              This is the main message that will be displayed in the popup
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={popupButtonText}
              onChange={(e) => setPopupButtonText(e.target.value)}
              placeholder="e.g., Learn More, Visit Now"
              className="input-noir w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              The text that will appear on the button
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Button Link
            </label>
            <input
              type="url"
              value={popupButtonLink}
              onChange={(e) => setPopupButtonLink(e.target.value)}
              placeholder="https://example.com or https://t.me/yourgroup"
              className="input-noir w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              The URL where users will be redirected when clicking the button
            </p>
          </div>

          <button
            type="submit"
            disabled={savingPopup}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPopup ? 'Saving...' : 'Save Popup Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}
