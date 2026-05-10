import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role === 'admin') redirect('/admin')

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ backgroundColor: '#FFFBF4' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
