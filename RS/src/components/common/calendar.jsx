// import React from 'react';

// const Calendar = ({ currentDate = new Date(2026, 0, 19) }) => {
//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
//   const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

//   const month = currentDate.getMonth();
//   const year = currentDate.getFullYear();
//   const today = currentDate.getDate();

//   const firstDay = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const generateCalendarDays = () => {
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
//     }
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       const isToday = day === today;
//       days.push(
//         <div
//           key={day}
//           className={`
//             aspect-square flex items-center justify-center text-sm transition-all
//             ${isToday 
//               ? 'bg-emerald-500 text-white rounded-full font-semibold shadow-lg shadow-emerald-500/20' 
//               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full cursor-pointer'
//             }
//           `}
//         >
//           {day}
//         </div>
//       );
//     }
//     return days;
//   };

//   return (
//     <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
//       <div className="mb-4">
//         <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
//           {monthNames[month]} {year}
//         </h3>
//       </div>

//       <div className="grid grid-cols-7 gap-2">
//         {dayNames.map(day => (
//           <div key={day} className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 text-center py-2">
//             {day}
//           </div>
//         ))}
//         {generateCalendarDays()}
//       </div>
//     </div>
//   );
// };

// export default Calendar;