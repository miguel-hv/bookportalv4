export default function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg border border-gray-100">
      <p className="text-gray-600">{message}</p>
    </div>
  )
}
