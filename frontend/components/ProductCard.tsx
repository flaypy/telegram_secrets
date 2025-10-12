'use client';

import { useTranslations } from 'next-intl';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('store');

  // Get minimum price
  const minPrice = product.prices?.reduce((min, price) => {
    return price.amount < min.amount ? price : min;
  }, product.prices[0]);

  return (
    <div className="card-noir group cursor-pointer">
      {/* Image */}
      <div className="relative h-64 mb-4 rounded-lg overflow-hidden bg-noir-medium">
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
            <span className="text-red-400 font-bold">Inactive</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-xl font-bold mb-2 text-accent-gold group-hover:text-accent-rose transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          {minPrice && (
            <div className="text-gray-300">
              <span className="text-xs text-gray-500">{t('priceFrom')}</span>
              <div className="font-bold">
                {minPrice.currency} {minPrice.amount.toFixed(2)}
              </div>
            </div>
          )}
          <button className="btn-secondary text-sm">
            {t('viewDetails')}
          </button>
        </div>

        {/* Categories */}
        {product.prices && product.prices.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.prices.map((price) => (
              <span
                key={price.id}
                className="px-2 py-1 bg-noir-medium text-xs rounded text-gray-400"
              >
                {price.category}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
