export default function Searchbar({search, setSearch}: {search: string, setSearch: (search: string) => void}) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search friends..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}