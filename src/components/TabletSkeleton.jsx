const TabletSkeleton = () => {
  const isEvent = (num) => Number.isInteger(num / 2);

  return (
    <>
      <div className="overflow-hidden rounded-lg shadow-lg w-full">
        <table className="w-full bg-white table-fixed">
          <thead className="bg-emerald-500 text-white">
            <tr className="text-left">
              <th className="p-5 w-1/6">Nombre</th>
              <th className="p-5 w-1/12">Edad</th>
              <th className="p-5 w-1/6">Teléfono</th>
              <th className="p-5 w-1/6">Comunicación</th>
              <th className="p-5 w-1/6">Otros Teléfono</th>
              <th className="p-5 w-1/12"></th>
              <th className="p-5 w-1/12"></th>
              <th className="p-5 w-1/12"></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr
                key={i}
                className={`text-left border-solid border-b border-gray-200 ${
                  isEvent(i) ? 'bg-gray-300' : 'bg-gray-200'
                }`}
              >
                <td className="px-5 py-7">
                  <div className="h-4 bg-gray-400 rounded w-3/4 animate-pulse"></div>
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 bg-gray-400 rounded w-1/2 animate-pulse"></div>
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 bg-gray-400 rounded w-2/3 animate-pulse"></div>
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 bg-gray-400 rounded w-1/3 animate-pulse"></div>
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 bg-gray-400 rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-400 rounded w-2/3 animate-pulse mt-2"></div>
                </td>
                <td className="p-2">
                  <div className="h-8 bg-gray-400 rounded w-20 animate-pulse"></div>
                </td>
                <td className="p-2">
                  <div className="h-8 bg-gray-400 rounded w-20 animate-pulse"></div>
                </td>
                <td className="p-2">
                  <div className="h-8 bg-gray-400 rounded w-20 animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TabletSkeleton;
