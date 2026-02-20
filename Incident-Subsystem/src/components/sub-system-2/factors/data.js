export const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export const reportShare = [
  { name: "BID", value: 44 },
  { name: "COR", value: 31 },
  { name: "COI", value: 25 },
];

export const monthlyDemandForecast = [
  { month: "Jan", BID: 120, COR: 90, COI: 70 },
  { month: "Feb", BID: 135, COR: 96, COI: 74 },
  { month: "Mar", BID: 142, COR: 102, COI: 78 },
  { month: "Apr", BID: 155, COR: 110, COI: 84 },
  { month: "May", BID: 163, COR: 118, COI: 88 },
  { month: "Jun", BID: 171, COR: 126, COI: 92 },
];

export const residentVsNonResident = [
  { name: "Resident", value: 368 },
  { name: "Non-Resident", value: 104 },
];

export const queueProcessingTime = [
  { type: "BID", minutes: 18 },
  { type: "COR", minutes: 12 },
  { type: "COI", minutes: 15 },
];

export const backlogRate = [
  { week: "W1", rate: 8 },
  { week: "W2", rate: 10 },
  { week: "W3", rate: 9 },
  { week: "W4", rate: 7 },
];

export const heatmapRows = [
  { hour: "8-10 AM", mon: 14, tue: 16, wed: 13, thu: 18, fri: 12 },
  { hour: "10-12 NN", mon: 20, tue: 21, wed: 19, thu: 24, fri: 17 },
  { hour: "1-3 PM", mon: 17, tue: 18, wed: 16, thu: 19, fri: 14 },
  { hour: "3-5 PM", mon: 9, tue: 11, wed: 10, thu: 12, fri: 8 },
];

export const indigencyDemographic = [
  { group: "Low Income", value: 58 },
  { group: "Unemployed", value: 24 },
  { group: "Senior", value: 10 },
  { group: "PWD", value: 8 },
];

export const ageGenderDistribution = [
  { age: "18-24", male: 36, female: 42 },
  { age: "25-34", male: 49, female: 53 },
  { age: "35-44", male: 34, female: 37 },
  { age: "45+", male: 29, female: 31 },
];

export const purposeOfRequests = [
  { name: "Employment", value: 34 },
  { name: "Scholarship", value: 22 },
  { name: "Medical", value: 20 },
  { name: "Legal", value: 14 },
  { name: "Other", value: 10 },
];
