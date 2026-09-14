'use client';
import { Pencil, Plus, Search, Trash } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/InputField';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { deleteProduct, getProducts } from '@/services/product.service';
import { useAuth } from '@/components/auth/Auth-provider';

function ProductsPage() {
  const [search, setSearch] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const {user} = useAuth()

  const loadProducts = async () => {
    try {
      if(!user) return
      setLoading(true);
      setError('');
      const data = await getProducts(user.uid);
      setProducts(data);
    } catch (error) {
      console.log(error);
      setError('Gagal Memuat Produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!user)return
    const confirmed = window.confirm('Yakin ingin menghapus produk ini? .');
    if (!confirmed) return;
    await deleteProduct(user.uid,id);
    await loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(keyword) || product.sku.toLowerCase().includes(keyword));
  }, [products, search]);
  // const filterProducts = products.filter((product) => {
  //   const keyword = search.toLocaleLowerCase();
  //   return products.filter((product) => product.name.toLowerCase().includes(keyword) || product.sku.toLowerCase().includes(keyword));
  // });
  if (loading) {
    return <div className='rounded-2xl border bg-white p-6'>Memuat data Produk</div>;
  }
  if (error) {
    return <div className='rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700'>{error}</div>;
  }
  return (
    <div className=''>
      <div>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className=''>
            <p className='text-sm font-bold text-indigo-600'>MASTER DATA</p>
            <h1 className='mt-1 text-3xl font-black tracking-tight'>Produk</h1>
            <p className='mt-2 text-sm text-slate-500'>Kelola Produk, Harga dan Stok</p>
          </div>
          <Link href={'products/create'}>
            <Button className='w-full sm:w-auto'>
              <Plus size={18} />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>
      <div className='mt-2 mb-5 max-w-md'>
        <Input placeholder='Cari nama atau SKU....' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-3' />
      </div>
      {filtered.length > 0 && (
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                <tr>
                  <th className='px-5 py-4'>Produk</th>
                  <th className='px-5 py-4'>SKU</th>
                  <th className='px-5 py-4'>Harga</th>
                  <th className='px-5 py-4'>Stok</th>
                  <th className='px-5 py-4 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filtered.map((product) => {
                  const stockColor = product.stock <= 5 ? ' bg-amber-100 text-amber-800' : ' bg-emerald-100 text-emerald-800';
                  return (
                    <tr key={product.id} className='hover:bg-slate-50/70'>
                      <td className='px-5 py-4 font-bold text-slate-900'>{product.name}</td>
                      <td className='px-5 py-4 text-slate-500'>{product.sku}</td>
                      <td className='px-5 py-4 font-semibold text-slate-500'>{formatCurrency(product.price)}</td>
                      <td className='px-5 py-4'>
                        <span className={'rounded-full px-2.5 py-1 text-xs font-bold' + stockColor}>{product.stock}</span>
                      </td>
                      <td className='px-5 py-4 '>
                        <div className='flex justify-center gap-2'>
                          <Link href={`/products/${product.id}/edit/`} className='rounded-lg border px-3 py-2 text-sm text-slate-600 hover:bg-slate-300 transition-colors duration-300'>
                            <Pencil size={18} />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className='rounded-lg px-3 py-2 border border-rose-200 text-sm text-rose-600 cursor-pointer hover:bg-rose-100 transition-colors duration-300'>
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && <EmptyState title='Belum ada Produk' description='Tambahkan Produk pertama untuk memulai transaksi POS' />}
      {filtered.length > 0 && filtered.length === 0 && (
        <div className='rounded-2xl bg-white p-8 text-center text-sm text-slate-500'>
          <Search className='mx-auto mb-2' />
          Produk tidak ditemukan
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
