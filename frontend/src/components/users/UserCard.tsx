import type { User } from '@/lib/auth-types'

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export default function UserCard({ user }: { user: User }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
      <p className="text-lg font-semibold text-gray-800">
        @{user.name}
      </p>
      {user.createdAt && (
        <p className="mt-1 text-sm text-gray-500">
          Miembro desde: {formatDate(user.createdAt)}
        </p>
      )}
    </div>
  )
}
