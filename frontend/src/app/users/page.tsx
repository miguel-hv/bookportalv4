import type { Metadata } from 'next'
import UserList from '@/components/users/UserList'

export const metadata: Metadata = {
  title: 'Usuarios — Bookportal',
}

export default function UsersPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
      <UserList />
    </main>
  )
}
