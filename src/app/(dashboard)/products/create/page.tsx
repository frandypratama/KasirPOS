'use client';
import { useAuth } from '@/components/auth/Auth-provider';
import { ProductForm } from '@/components/products/Product-form';
import { addProduct } from '@/services/product.service';
import { ProductInput } from '@/types/product';
import { useRouter } from 'next/navigation';

function ProductsCreate() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleCreateProduct(values: ProductInput) {
    if (!user) return;
    await addProduct(user.uid, values);
    router.push('/products');
  }
  return (
    <div className='w-full'>
      <div className='max-w-2xl mx-auto'>
        <p className='text-sm font-bold text-indigo-600'>MASTER DATA</p>
        <h1 className='mt-1 text-3xl font-black tracking-tight'>Tambah Produk</h1>
        <p className='mt-2 text-sm text-slate-500'>Isi data produk yang akan dijual di miniPOS.</p>
        <div className='mt-6 rounded-2xl border bg-white p-5 shadow-sm '>
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      </div>
    </div>
  );
}

export default ProductsCreate;
