'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { ProductInput } from '@/types/product';
import { FormErrors } from '@/types/error';
import { validateProduct } from '@/lib/product-storage';
// import { validateProduct } from '@/utils/helper';
// import validateProduct from '@/utils/helper';

type ProductFormProps = {
  initialValues?: ProductInput;
  submitLabel?: string;
  onSubmit: (values: ProductInput) => void;
};

const defaultValue: ProductInput = {
  name: '',
  sku: '',
  price: 0,
  stock: 0,
};

export function ProductForm({ initialValues = defaultValue, submitLabel = 'Simpan', onSubmit }: ProductFormProps) {
  // const [form, setForm] = useState<ProductInput>();
  const [values, setValues] = useState<ProductInput>({
    name: initialValues.name ?? '',
    sku: initialValues.sku ?? '',
    price: initialValues.price ?? '',
    stock: initialValues.stock ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  function updateField(field: keyof ProductInput, value: string) {
    setValues((current) => ({
      ...current,
      [field]: field === 'price' || field === 'stock' ? Number(value) : value,
    }));
  }

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateProduct(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='' className='text-sm font-bold text-slate-700'>
            Nama Produk
          </label>
          <Input value={values.name} onChange={(event) => updateField('name', event.target.value)} placeholder='Contoh : Kopi Susu' />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='' className='text-sm font-bold text-slate-700'>
            SKU
          </label>
          <Input value={values.sku} onChange={(event) => updateField('sku', event.target.value)} placeholder='Contoh : KOPI001' />
        </div>
        <div className='flex flex-row gap-4 w-full'>
          <div className='flex-1 flex-col gap-2'>
            <label htmlFor='' className='text-sm font-bold text-slate-700'>
              Price
            </label>
            <Input type='number' value={values.price} onChange={(event) => updateField('price', event.target.value)} />
          </div>
          <div className='flex-1 flex-col gap-2'>
            <label htmlFor='' className='text-sm font-bold text-slate-700'>
              Stock
            </label>
            <Input type='number' value={values.stock} onChange={(event) => updateField('stock', event.target.value)} />
          </div>
        </div>
      </div>

      {errors.name && <p className='mt-1 text-sm font-semibold text-red-600'>{errors.name}</p>}
      <div className='flex items-center justify-end gap-3 py-2'>
        <Link
          href={'/products'}
          className='border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed'>
          Batal
        </Link>
        <Button type='submit' className='cursor-pointer'>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
