export default function EmptyState({ message = "Nothing here yet" }) {
  return (
    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
      <p className="text-lg">{message}</p>
    </div>
  );
}