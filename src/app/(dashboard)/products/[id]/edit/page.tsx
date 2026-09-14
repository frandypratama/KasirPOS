// import React from 'react'
'use client';

import { useAuth } from '@/components/auth/Auth-provider';
import { ProductForm } from '@/components/products/ProductForm';
import { getProductById, updateProduct } from '@/services/product.service';
import { Product, ProductInput } from '@/types/product';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  async function handleSubmit(input: ProductInput) {
    if (!user) return;
    if (!product) return;
    await updateProduct(user.uid, product.id, input);
    router.push('/products');
  }
  useEffect(() => {
    async function loadDataProduct() {
      if (!user) return;
      const data = await getProductById(user.uid, params.id);
      setProduct(data ?? null);
    }
    loadDataProduct();
    setLoading(false);
  }, [params.id]);
  if (loading) return <p>Memuat produk</p>;
  if (!product) return <p>Produk tidak ditemukan</p>;
  return (
    <div className=''>
      <p className='text-sm font-bold text-indigo-600'>MASTER DATA</p>
      <h1 className='mt-1 text-3xl font-black'>Edit Product</h1>
      <ProductForm initialValues={product} submitLabel='Simpan Perubahan' onSubmit={handleSubmit} />
    </div>
  );
}

export default EditProductPage;
