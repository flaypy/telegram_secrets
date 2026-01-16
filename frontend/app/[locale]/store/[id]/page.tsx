'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { productAPI, paymentAPI, Product } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import UrgencyPopup from '@/components/UrgencyPopup';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const locale = useLocale();
  const t = useTranslations('productDetails');
  const tCommon = useTranslations('common');

  const [product, setProduct] = useState<Product | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<'pushinpay' | 'syncpay'>('pushinpay');
  const [blackFridayPromo, setBlackFridayPromo] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchGatewayConfig();
    fetchPromoStatus();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const data = await productAPI.getById(productId);
      setProduct(data.product);
      setDetectedCountry(data.detectedCountry); // Keep for payment logic, just don't display
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGatewayConfig = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/settings/public`);
      const data = await response.json();
      if (data.paymentGateway) {
        setPaymentGateway(data.paymentGateway);
      }
    } catch (err) {
      console.error('Failed to fetch gateway config:', err);
      // Keep default gateway
    }
  };

  const fetchPromoStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/settings/public`);
      const data = await response.json();
      setBlackFridayPromo(data.blackFridayPromo || false);
    } catch (err) {
      console.error('Failed to fetch promo status:', err);
    }
  };

  const handlePurchase = async (priceId: string) => {
    setProcessingPayment(true);
    try {
      const params: any = {
        priceId,
        gateway: paymentGateway,
      };

      // Add fixed/generic client info if using SyncPay
      if (paymentGateway === 'syncpay') {
        params.clientName = 'Cliente Telegram Secrets';
        params.clientCpf = '00000000000';
        params.clientEmail = 'cliente@telegram-secrets.com';
        params.clientPhone = '11999999999';
      }

      const response = await paymentAPI.initiatePayment(params);

      // Store payment data in sessionStorage for the payment page
      sessionStorage.setItem(
        `payment_${response.orderId}`,
        JSON.stringify(response)
      );

      // Redirect to payment page with QR code (locale is automatically included by next-intl routing)
      router.push(`/${locale}/payment/${response.orderId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate payment');
      console.error(err);
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{error || 'Product not found'}</h1>
          <Link href="/store" className="btn-secondary">
            {t('backToStore')}
          </Link>
        </div>
      </div>
    );
  }

  // Determine if user is from Brazil
  const isBrazilianUser = detectedCountry === 'BR';

  // Breadcrumb for SEO
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://telegram-secrets.com';
  const breadcrumbItems = [
    { name: 'Home', url: `${baseUrl}/${locale}` },
    { name: 'Store', url: `${baseUrl}/${locale}/store` },
    { name: product.name, url: `${baseUrl}/${locale}/store/${product.id}` },
  ];

  return (
    <>
      {/* SEO Structured Data */}
      <ProductStructuredData product={product} locale={locale} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      {/* Urgency Popup */}
      <UrgencyPopup />

      <div className="min-h-screen py-8 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back link - larger tap target on mobile */}
          <Link href="/store" className="text-accent-gold hover:underline mb-6 md:mb-8 inline-flex items-center gap-2 py-2 text-base md:text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToStore')}
          </Link>

          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
            {/* Product Image and Preview Media */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-noir-dark">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image';
                  }}
                />
                {blackFridayPromo && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-accent-rose to-accent-purple text-white font-bold px-4 py-3 rounded-xl shadow-lg transform rotate-3 animate-pulse">
                      <div className="text-sm uppercase tracking-wide">Black Friday</div>
                      <div className="text-2xl">-10% OFF</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Media (Video/Image/GIF) */}
              {product.previewMediaUrl && (
                <div className="relative rounded-lg overflow-hidden bg-noir-dark">
                  {/* Detect if it's a video or image based on file extension */}
                  {/(\.mp4|\.webm|\.ogg)$/i.test(product.previewMediaUrl) ? (
                    <video
                      src={product.previewMediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Failed to load video preview');
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={product.previewMediaUrl}
                      alt={`${product.name} preview`}
                      className="w-full h-auto object-contain"
                      onError={(e) => {
                        console.error('Failed to load preview media');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-accent-gold mb-3 md:mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="prose prose-invert mb-6 md:mb-8">
                <p className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* CONDITIONAL LOGIC: Brazilian vs Non-Brazilian */}
              {isBrazilianUser ? (
                // BRAZIL: Show price tiers and payment options
                <div>
                  {blackFridayPromo && (
                    <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-accent-rose/20 to-accent-purple/20 rounded-lg border-2 border-accent-gold text-center">
                      <p className="text-base md:text-lg font-bold text-accent-gold">
                        🎉 Promoção Black Friday Ativa! 🎉
                      </p>
                      <p className="text-xs md:text-sm text-gray-300 mt-1">
                        Todos os preços já estão com 10% de desconto aplicado
                      </p>
                    </div>
                  )}

                  <h2 className="text-xl md:text-2xl font-bold text-accent-rose mb-4 md:mb-6">
                    {t('selectQuality')}
                  </h2>

                  {product.prices && product.prices.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {product.prices
                          .slice() // Cria uma cópia para não alterar o estado original
                          .sort((a, b) => a.amount - b.amount) // Ordena pelo preço (amount)
                          .map((price) => (
                        <div
                          key={price.id}
                          className="card-noir flex flex-col md:flex-row items-stretch md:items-center justify-between hover:border-accent-rose transition-all gap-3 md:gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 md:gap-3 mb-1">
                              <h3 className="text-lg md:text-xl font-bold text-accent-gold">
                                {price.category}
                              </h3>
                              {blackFridayPromo && (
                                <span className="bg-accent-rose text-white text-xs font-bold px-2 py-1 rounded uppercase">
                                  -10%
                                </span>
                              )}
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-gray-100">
                              {price.currency} {price.amount.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePurchase(price.id)}
                            disabled={processingPayment}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto py-4 md:py-3 text-base md:text-base whitespace-nowrap"
                          >
                            {processingPayment ? t('processing') : t('buyNow')}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">{t('noPricesAvailable')}</p>
                  )}

                  <div className="mt-6 md:mt-8 p-4 md:p-6 bg-noir-medium rounded-lg border border-noir-light">
                    <h3 className="font-bold text-accent-purple mb-2 text-base md:text-base">{t('securePayment')}</h3>
                    <p className="text-sm text-gray-400">{t('securePaymentDesc')}</p>
                  </div>
                </div>
              ) : (
                // NON-BRAZIL: Show Bitcoin and/or Telegram payment options
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-accent-purple mb-4 md:mb-6">
                    {t('internationalPayment')}
                  </h2>

                  {/* Show message if no payment options available */}
                  {!product.prices?.filter(p => p.currency === 'USD').length && !product.telegramLink && (
                    <div className="card-noir bg-gradient-to-br from-red-500/10 to-noir-dark border-red-500/50 text-center">
                      <p className="text-gray-300 mb-2">
                        {t('noPricesAvailable')}
                      </p>
                      <p className="text-sm text-gray-400">
                        Please contact support for purchase options.
                      </p>
                    </div>
                  )}

                  {/* Bitcoin Payment Option - Only show if USD prices exist */}
                  {product.prices && product.prices.filter(p => p.currency === 'USD').length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-accent-gold mb-3">
                        💰 {t('payWithBitcoin')}
                      </h3>
                      <div className="space-y-3">
                        {product.prices
                          .filter(p => p.currency === 'USD')
                          .sort((a, b) => a.amount - b.amount)
                          .map((price) => (
                            <div
                              key={price.id}
                              className="card-noir flex flex-col md:flex-row items-stretch md:items-center justify-between hover:border-accent-gold transition-all gap-3 md:gap-4 bg-gradient-to-br from-accent-gold/5 to-noir-dark border-accent-gold/50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 md:gap-3 mb-1">
                                  <h4 className="text-lg md:text-xl font-bold text-accent-gold">
                                    {price.category}
                                  </h4>
                                  <span className="bg-accent-gold/20 text-accent-gold text-xs font-bold px-2 py-1 rounded uppercase border border-accent-gold/30">
                                    Bitcoin
                                  </span>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-gray-100">
                                  ${price.amount.toFixed(2)} USD
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  + 3% fee (converted to BTC)
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  // Store selected price and redirect to Bitcoin payment
                                  sessionStorage.setItem('bitcoin_price_id', price.id);
                                  router.push(`/${locale}/payment/bitcoin/${price.id}`);
                                }}
                                disabled={processingPayment}
                                className="btn-primary bg-gradient-to-r from-accent-gold to-yellow-600 hover:from-yellow-600 hover:to-accent-gold disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto py-4 md:py-3 text-base md:text-base whitespace-nowrap"
                              >
                                {t('payWithBitcoin')}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Telegram Option - Only show if telegramLink exists */}
                  {product.telegramLink && (
                    <div className="card-noir bg-gradient-to-br from-accent-purple/10 to-noir-dark border-accent-purple">
                      <h3 className="text-lg font-bold text-accent-purple mb-3">
                        📱 {t('purchaseViaTelegram')}
                      </h3>
                      <p className="text-gray-300 mb-4 text-sm">
                        {t('telegramPurchaseDesc')}
                      </p>

                      <a
                        href={product.telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full text-center text-base inline-block py-3"
                      >
                        {t('completePurchaseOnTelegram')}
                      </a>
                    </div>
                  )}

                  {/* Info Box - Only show if at least one payment option exists */}
                  {(product.prices?.filter(p => p.currency === 'USD').length > 0 || product.telegramLink) && (
                    <div className="mt-6 p-4 md:p-6 bg-noir-medium rounded-lg border border-noir-light">
                      <h3 className="font-bold text-accent-gold mb-2 text-sm">{t('secureBitcoinPayment')}</h3>
                      <p className="text-xs text-gray-400">{t('secureBitcoinPaymentDesc')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
