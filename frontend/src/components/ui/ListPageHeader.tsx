import Link from 'next/link'

interface ListPageHeaderProps {
  title: string
  action?: {
    label: string
    href: string
  }
}

export default function ListPageHeader({ title, action }: ListPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <h1 className="text-3xl font-bold text-gray-800">
        {title}
      </h1>
      {action && (
        <Link
          href={action.href}
          className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
