import { redirect } from 'next/navigation';
import React from 'react'

function Home() {
  redirect('/dashboard')
}

export default Home