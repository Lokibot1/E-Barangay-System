export const getResidencyLabel = (startDate) => {
  if (!startDate) return 'new';
  const start = new Date(startDate);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  
  if (years <= 1) return 'new';
  if (years <= 5) return 'established';
  if (years <= 10) return 'long-term';
  return 'pioneer';
};