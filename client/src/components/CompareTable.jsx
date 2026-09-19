import { useState } from 'react';

function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const RANK_EMOJI = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function CompareTable({ results }) {
  const [sortKey, setSortKey]   = useState('netReturn');
  const [sortDir, setSortDir]   = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...results].sort((a, b) => {
    const aVal = key(a, sortKey);
    const bVal = key(b, sortKey);
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const headers = [
    { key: 'rank',         label: 'Rank',          sortable: false },
    { key: 'market.name',  label: 'Market',         sortable: false },
    { key: 'pricePerKg',   label: 'Price/kg',       sortable: true  },
    { key: 'distanceKm',   label: 'Distance',       sortable: true  },
    { key: 'transportCost',label: 'Transport Cost', sortable: true  },
    { key: 'grossRevenue', label: 'Gross Revenue',  sortable: true  },
    { key: 'netReturn',    label: 'Net Return ↕',   sortable: true  },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-agri-700 text-white">
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => h.sortable && handleSort(h.key)}
                className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${h.sortable ? 'cursor-pointer hover:bg-agri-600 select-none' : ''}`}
              >
                {h.label}
                {h.sortable && sortKey === h.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, idx) => (
            <tr
              key={r.market._id}
              className={`border-t border-gray-100 hover:bg-agri-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="px-4 py-3 font-bold text-center">
                {RANK_EMOJI[r.rank] || `#${r.rank}`}
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-gray-800">{r.market.name}</div>
                <div className="text-xs text-gray-400">{r.market.district}</div>
              </td>
              <td className="px-4 py-3 font-semibold text-agri-700">
                {formatCurrency(r.pricePerKg)}
              </td>
              <td className="px-4 py-3 text-gray-600">{r.distanceKm} km</td>
              <td className="px-4 py-3 text-red-600">{formatCurrency(r.transportCost)}</td>
              <td className="px-4 py-3 text-gray-700">{formatCurrency(r.grossRevenue)}</td>
              <td className="px-4 py-3">
                <span className="font-extrabold text-agri-600 bg-agri-50 px-2 py-1 rounded-lg">
                  {formatCurrency(r.netReturn)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to get nested value for sorting
function key(obj, k) {
  switch (k) {
    case 'pricePerKg':    return obj.pricePerKg;
    case 'distanceKm':    return obj.distanceKm;
    case 'transportCost': return obj.transportCost;
    case 'grossRevenue':  return obj.grossRevenue;
    case 'netReturn':     return obj.netReturn;
    default:              return obj.rank;
  }
}
