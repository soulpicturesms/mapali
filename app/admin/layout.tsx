import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FFFBF4' }}>
      <AdminNav userName={session.user.name || 'Admin'} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
