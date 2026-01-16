'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  showDiscount?: boolean;
  detectedCountry?: string | null;
}

export default function ProductCard({ product, showDiscount = false, detectedCountry }: ProductCardProps) {
  const t = useTranslations('store');

  // Determine which currency to show based on detected country
  const isBrazil = detectedCountry === 'BR';
  const targetCurrency = isBrazil ? 'BRL' : 'USD';

  // Filter prices by currency and sort by amount
  const filteredPrices = (product.prices || [])
    .filter(price => price.currency === targetCurrency);

  const sortedPrices = [...filteredPrices].sort((a, b) => a.amount - b.amount);

  // Get minimum price (cheapest)
  const minPrice = sortedPrices[0];

  // Get middle price (most bought)
  const middlePrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

  // Get second most expensive (recommended)
  const secondMostExpensive = sortedPrices.length >= 2
    ? sortedPrices[sortedPrices.length - 2]
    : sortedPrices[sortedPrices.length - 1];

  return (
    <Link href={`/store/${product.id}`} className="block">
      <div className="card-noir group cursor-pointer">
      {/* Image */}
      <div className="relative h-56 md:h-64 mb-4 rounded-lg overflow-hidden bg-noir-medium">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            // Fallback for broken images
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {!product.isActive && (
          <div className="absolute inset-0 bg-noir-darker/80 flex items-center justify-center">
            <span className="text-red-400 font-bold text-base">Inactive</span>
          </div>
        )}
        {showDiscount && product.isActive && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-accent-rose to-accent-purple text-white font-bold px-3 py-2 rounded-lg shadow-lg transform rotate-3 animate-pulse">
              <div className="text-xs uppercase tracking-wide">Black Friday</div>
              <div className="text-lg">-10%</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-2 text-accent-gold group-hover:text-accent-rose transition-colors leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-400 text-base md:text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price Options - Simplified for Mobile */}
        <div className="mb-4 space-y-2">
          {/* Mobile: Show only "From" price */}
          <div className="md:hidden">
            {minPrice && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">{t('priceFrom')}</span>
                <span className="font-bold text-accent-gold text-xl">
                  {minPrice.currency} {minPrice.amount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Desktop: Show all tiers */}
          <div className="hidden md:block space-y-2">
            {minPrice && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{t('priceFrom')}</span>
                <span className="font-bold text-gray-300">
                  {minPrice.currency} {minPrice.amount.toFixed(2)}
                </span>
              </div>
            )}
            {middlePrice && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{t('mostBought')}</span>
                <span className="font-bold text-gray-300">
                  {middlePrice.currency} {middlePrice.amount.toFixed(2)}
                </span>
              </div>
            )}
            {secondMostExpensive && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{t('recommended')}</span>
                <span className="font-bold text-accent-gold">
                  {secondMostExpensive.currency} {secondMostExpensive.amount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CTA - Mobile optimized with better tap target */}
        <div className="flex justify-center">
          <span className="btn-secondary text-base font-semibold w-full text-center py-4 md:py-3">
            {t('viewDetails')}
          </span>
        </div>
      </div>
      </div>
    </Link>
  );
}
