'use client';

import React from 'react';
import ButtonLink from '../ui/ButtonLink';
import { Boxes, LayoutDashboard, ReceiptText, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import { useAuth } from '../auth/Auth-provider';

const menu = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Boxes },
  { href: '/transactions/new', label: 'Transactions baru', icon: ShoppingCart },
  { href: '/transactions', label: 'Transactions', icon: ReceiptText },
];

function SideBar() {
  const pathname = usePathname();
  const { logout } = useAuth()
  
  return (
    <aside className='bg-slate-950 text-white lg:min-h-screen lg:w-64'>
      <div className='p-5'>
        <div className='text-xl font-black '>MiniPOS</div>
        <div className='mt-1 text-xs text-slate-400'>Bootcamp Project</div>
      </div>
      <nav className='grid gap-2 px-4'>
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashbord' && pathname.startsWith(item.href));
          return (
            <ButtonLink className={`${active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`} key={item.href} href={item.href}>
              <Icon size={18} />
              {item.label}
            </ButtonLink>
          );
        })}
        <Button onClick={logout}>Logout</Button>
      </nav>
    </aside>
  );
}

export default SideBar;
