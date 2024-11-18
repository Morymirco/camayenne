'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '../components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminToken')
    if (!isAuthenticated) {
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="transition-all duration-300 md:ml-64">
        <div className="md:p-0 pt-16">
          {children}
        </div>
      </main>
    </div>
  )
} 