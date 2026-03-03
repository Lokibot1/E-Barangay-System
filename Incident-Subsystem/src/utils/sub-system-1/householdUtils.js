export const calculateHouseholdStats = (households) => {
  if (!households || households.length === 0) {
    return { total: 0, indigents: 0, owners: 0, priority: 0, ownerPercent: 0 };
  }

  const total = households.length;
  
  // 1. Count Indigents
  const indigents = households.filter(h => Number(h.is_indigent) === 1).length;
  
  // 2. Count Home Owners
  const owners = households.filter(h => h.tenure_status?.toLowerCase() === 'owned').length;

  // 3. Priority Heads (Senior or PWD)
  const priority = households.filter(h => {
    const headSector = h.head_sector?.toLowerCase() || '';
    return headSector.includes('senior') || headSector.includes('pwd');
  }).length;

  return {
    total,
    indigents,
    owners,
    priority,
    ownerPercent: total > 0 ? ((owners / total) * 100).toFixed(0) : 0
  };
};