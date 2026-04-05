import { redirect } from 'next/navigation';

export default function RootPage() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  }
  return null;
}