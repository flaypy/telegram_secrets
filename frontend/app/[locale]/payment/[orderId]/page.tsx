'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { paymentAPI, PixPaymentResponse, settingsAPI } from '@/lib/api';
import { Link } from '@/i18n/routing';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const locale = params.locale as string;
  const t = useTranslations('payment');

  const [paymentData, setPaymentData] = useState<PixPaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [forcedPurchaseEnabled, setForcedPurchaseEnabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Fetch forced purchase setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsAPI.getPublicSettings();
        setForcedPurchaseEnabled(settings.forcedPurchase || false);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Store payment data in sessionStorage for page refresh
  useEffect(() => {
    const storedData = sessionStorage.getItem(`payment_${orderId}`);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setPaymentData(data);
        setLoading(false);
      } catch (e) {
        console.error('Failed to parse stored payment data');
        setError(t('paymentNotFound'));
        setLoading(false);
      }
    } else {
      setError(t('paymentNotFound'));
      setLoading(false);
    }
  }, [orderId]);

  // Auto-check payment status every 10 seconds
  useEffect(() => {
    if (!paymentData) return;

    const interval = setInterval(async () => {
      try {
        const orderData = await paymentAPI.getOrder(orderId);
        if (orderData.order.status === 'COMPLETED') {
          clearInterval(interval);
          // Redirect to success page
          router.push(`/${locale}/payment/success/${orderId}`);
        } else if (orderData.order.status === 'FAILED') {
          clearInterval(interval);
          setError(t('paymentFailed'));
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [paymentData, orderId, router]);

  const copyPixCode = async () => {
    if (!paymentData) return;

    try {
      await navigator.clipboard.writeText(paymentData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const manualCheckStatus = async () => {
    if (!paymentData || checkingStatus) return;

    setCheckingStatus(true);

    // Increment click count
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    try {
      // If forced purchase is enabled and user clicked 3 times, force complete the order
      if (forcedPurchaseEnabled && newClickCount >= 3) {
        try {
          const result = await paymentAPI.forceCompleteOrder(orderId);
          if (result.success) {
            console.log('Order force completed successfully');
            router.push(`/${locale}/payment/success/${orderId}`);
            return;
          }
        } catch (forceError: any) {
          console.error('Error forcing order completion:', forceError);
          // If force complete fails, continue with normal check
        }
      }

      // Normal payment status check
      const orderData = await paymentAPI.getOrder(orderId);
      if (orderData.order.status === 'COMPLETED') {
        router.push(`/${locale}/payment/success/${orderId}`);
      } else if (orderData.order.status === 'FAILED') {
        setError(t('paymentFailed'));
      }
    } catch (err: any) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            {error || t('paymentNotFound')}
          </h1>
          <Link href="/store" className="btn-secondary">
            {t('backToStore')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 bg-gradient-to-b from-noir-darker via-noir-dark to-noir-darker">
      <div className="max-w-2xl mx-auto">
        {/* Header com efeito dourado luxuoso */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-300 via-accent-gold to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-accent-gold/50 animate-pulse">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-noir-darker" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold bg-gradient-to-r from-yellow-200 via-accent-gold to-yellow-400 bg-clip-text text-transparent mb-4 leading-tight">
            {t('pixPayment')}
          </h1>
          <p className="text-gray-300 text-base md:text-lg px-4 font-medium">
            {t('scanQrCode')}
          </p>
        </div>

        {/* Payment Info Card - Design Dourado Luxuoso */}
        <div className="relative bg-gradient-to-br from-noir-medium via-noir-dark to-noir-darker border-2 border-accent-gold rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-2xl shadow-accent-gold/20 overflow-hidden">
          {/* Efeito de brilho de fundo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="border-b-2 border-accent-gold/30 pb-4 md:pb-5 mb-4 md:mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-accent-gold mb-2 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                {paymentData.productName}
              </h2>
              <p className="text-gray-300 text-base md:text-lg font-medium">{paymentData.priceCategory}</p>
            </div>

            <div className="flex justify-between items-center bg-noir-darker/50 p-4 rounded-xl border border-accent-gold/20">
              <span className="text-gray-200 text-lg md:text-xl font-semibold">{t('amountToPay')}:</span>
              <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-accent-gold to-yellow-500 bg-clip-text text-transparent">
                {paymentData.amount}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code - Design Premium */}
        <div className="relative bg-gradient-to-br from-noir-medium via-noir-dark to-noir-darker border-2 border-accent-gold rounded-2xl p-6 md:p-8 text-center mb-6 md:mb-8 shadow-2xl shadow-accent-gold/20">
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-200 via-accent-gold to-yellow-400 bg-clip-text text-transparent mb-5 md:mb-6">
            {t('scanWithApp')}
          </h3>

          {paymentData.pixQrCodeBase64 ? (
            <>
              <div className="relative inline-block mb-5 md:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-accent-gold to-yellow-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-white p-4 md:p-5 rounded-2xl border-4 border-accent-gold shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      paymentData.pixQrCodeBase64.startsWith('data:')
                        ? paymentData.pixQrCodeBase64
                        : `data:image/png;base64,${paymentData.pixQrCodeBase64}`
                    }
                    alt="PIX QR Code"
                    width={280}
                    height={280}
                    className="rounded-lg w-full max-w-[280px] h-auto"
                    onError={(e) => {
                      console.error('QR Code failed to load');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
              <p className="text-sm md:text-base text-accent-gold font-semibold px-4 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {t('openBankApp')}
              </p>
            </>
          ) : (
            <div className="bg-noir-darker p-6 md:p-8 rounded-xl mb-4 border border-accent-gold/30">
              <p className="text-gray-400 text-sm md:text-base">
                {t('qrCodeNotAvailable')}
              </p>
            </div>
          )}
        </div>

        {/* Copy-Paste Code - Design Dourado Premium */}
        <div className="relative bg-gradient-to-br from-noir-medium via-noir-dark to-noir-darker border-2 border-accent-gold rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-2xl shadow-accent-gold/20 overflow-hidden">
          {/* Efeito de brilho */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-200 via-accent-gold to-yellow-400 bg-clip-text text-transparent mb-5 md:mb-6 flex items-center gap-2 justify-center">
              <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('orCopyCode')}
            </h3>

            <div className="bg-noir-darker p-4 md:p-5 rounded-xl border-2 border-accent-gold/30 mb-5 shadow-inner">
              <code className="text-sm md:text-base text-accent-gold break-all leading-relaxed font-mono">
                {paymentData.pixCode}
              </code>
            </div>

            <button
              onClick={copyPixCode}
              className={`w-full py-5 text-lg md:text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                copied
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/50'
                  : 'bg-gradient-to-r from-yellow-400 via-accent-gold to-yellow-500 text-noir-darker hover:from-yellow-300 hover:to-yellow-400 shadow-accent-gold/50'
              }`}
            >
              <span className="flex items-center justify-center gap-3">
                {copied ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t('copyPixCode')}
                  </>
                )}
              </span>
            </button>

            <div className="mt-5 p-4 bg-accent-gold/10 rounded-lg border border-accent-gold/30">
              <p className="text-xs md:text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {t('instructions')}
              </p>
            </div>
          </div>
        </div>

        {/* Status Check - Design Premium */}
        <div className="relative bg-gradient-to-br from-noir-medium via-noir-dark to-noir-darker border-2 border-accent-gold rounded-2xl p-6 md:p-8 text-center shadow-2xl shadow-accent-gold/20">
          <div className="mb-5">
            <p className="text-gray-200 text-base md:text-lg font-semibold">
              {forcedPurchaseEnabled ? '🎁 Clique no botão abaixo para resgatar seu pedido' : t('waitingConfirmation')}
            </p>
          </div>

          {!forcedPurchaseEnabled && (
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="animate-spin rounded-full h-5 w-5 border-t-3 border-b-3 border-accent-gold"></div>
              <span className="text-sm md:text-base text-accent-gold font-medium">
                {t('checkingStatus')}
              </span>
            </div>
          )}

          {forcedPurchaseEnabled && clickCount > 0 && clickCount < 3 && (
            <div className="mb-5 p-4 bg-gradient-to-r from-accent-gold/20 to-yellow-500/20 rounded-xl border-2 border-accent-gold shadow-lg">
              <p className="text-accent-gold text-base md:text-lg font-bold">
                ✨ {clickCount === 1 && 'Clique mais 2 vezes para resgatar'}
                {clickCount === 2 && 'Clique mais 1 vez para resgatar'}
              </p>
            </div>
          )}

          <button
            onClick={manualCheckStatus}
            disabled={checkingStatus}
            className={`w-full py-5 text-lg md:text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl ${
              forcedPurchaseEnabled
                ? 'bg-gradient-to-r from-yellow-400 via-accent-gold to-yellow-500 text-noir-darker hover:from-yellow-300 hover:to-yellow-400 shadow-accent-gold/50'
                : 'bg-gradient-to-r from-accent-purple to-accent-rose text-white hover:from-accent-purple/90 hover:to-accent-rose/90 shadow-accent-purple/50'
            } ${checkingStatus ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            <span className="flex items-center justify-center gap-3">
              {checkingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                  {t('checking')}
                </>
              ) : forcedPurchaseEnabled ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  Resgatar meu pedido
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('checkStatusNow')}
                </>
              )}
            </span>
          </button>

          {!forcedPurchaseEnabled && (
            <div className="mt-5 p-3 bg-noir-darker/50 rounded-lg border border-accent-gold/20">
              <p className="text-xs md:text-sm text-gray-400">
                {t('paymentExpires')}: <span className="text-accent-gold font-semibold">{paymentData.expiresAt ? new Date(paymentData.expiresAt).toLocaleString() : 'N/A'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Back Link - Better tap target */}
        <div className="text-center mt-8 md:mt-10">
          <Link href="/store" className="text-accent-gold hover:text-yellow-300 inline-flex items-center gap-2 py-3 text-base md:text-lg font-semibold transition-all hover:gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToStore')}
          </Link>
        </div>
      </div>
    </div>
  );
}
