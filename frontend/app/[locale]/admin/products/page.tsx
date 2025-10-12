'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { adminAPI, Product } from '@/lib/api';

export default function AdminProductsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await adminAPI.getProducts();
      setProducts(data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, formData);
      } else {
        await adminAPI.createProduct(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', imageUrl: '', isActive: true });
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await adminAPI.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
            setFormData({ name: '', description: '', imageUrl: '', isActive: true });
          }}
          className="btn-primary"
        >
          {showForm ? tCommon('cancel') : t('createProduct')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card-noir mb-8">
          <h2 className="text-2xl font-bold mb-6 text-accent-gold">
            {editingProduct ? t('editProduct') : t('createProduct')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('productName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-noir"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('productDescription')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-noir"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('productImage')}
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="input-noir"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">{t('isActive')}</label>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                {tCommon('save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="btn-secondary"
              >
                {tCommon('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="card-noir overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir-light">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Prices</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-noir-medium">
                <td className="py-3 px-4">{product.name}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      product.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">{product.prices?.length || 0} price(s)</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-accent-gold hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:underline"
                    >
                      {tCommon('delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
