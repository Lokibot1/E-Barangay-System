export const calculateHouseholdStats = (households) => {
  if (!households || households.length === 0) {
    return { total: 0, avgSize: 0, indigentCount: 0, densestPurok: 'N/A' };
  }

  const total = households.length;
  
  // Sum of all members
  const totalMembers = households.reduce((sum, h) => sum + (Number(h.members) || 0), 0);
  
  // Count indigents
  const indigentCount = households.filter(h => h.is_indigent).length;

  // Find Purok with most households
  const purokCounts = households.reduce((acc, h) => {
    acc[h.purok] = (acc[h.purok] || 0) + 1;
    return acc;
  }, {});
  
  const densestPurok = Object.keys(purokCounts).reduce((a, b) => 
    purokCounts[a] > purokCounts[b] ? a : b
  , 'N/A');

  return {
    total,
    avgSize: (totalMembers / total).toFixed(1),
    indigentCount,
    densestPurok: `Purok ${densestPurok}`
  };
};