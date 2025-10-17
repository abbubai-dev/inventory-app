export default function Navbar() {
  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center rounded-md mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600">□</div>
        <h1 className="text-xl font-semibold">Inventory Dashboard</h1>
      </div>
      <div className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center">👤</div>
    </div>
  );
}