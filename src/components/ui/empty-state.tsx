import Link from 'next/link';
import Button from './Button';
import { Plus } from 'lucide-react';

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center '>
      <h3 className='font-bold text-slate-900'>{title}</h3>
      <p className='mt-2 mb-4 text-sm text-slate-500'>{description}</p>
      <Link className='' href={'products/create'}>
        <Button className='w-full sm:w-auto'>
          <Plus size={18} />
          Tambah Produk
        </Button>
      </Link>
    </div>
  );
}

export default EmptyState;
