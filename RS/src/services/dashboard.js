// src/services/dashboardService.js

/**
 * Once you have Laravel, you can replace this with:
 * const response = await axios.get('/api/dashboard');
 * return response.data;
 */
export const getDashboardData = async () => {
  // Mock data simulating a database response where all residents are verified
  return {
    stats: {
      totalResidents: 1248,        
      households: 312,            
      verifiedIds: 500,          
      pendingVerification: 0      
    },
    registrations: [
      { id: 1, name: 'Juan Dela Cruz', role: 'Member of Household', age: 40, address: 'Blk 1, 15th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 2, name: 'John Cruz', role: 'Head of Household', age: 35, address: 'Blk 3, 12th Street, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 3, name: 'Maria Santos', role: 'Member of Household', age: 28, address: 'Blk 5, Tandang Sora St., San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 4, name: 'Pedro Rizal', role: 'Head of Household', age: 50, address: 'Purok 3, Congressional Ave, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 5, name: 'Ana Garcia', role: 'Member of Household', age: 22, address: 'Blk 2, 8th Avenue, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 6, name: 'Jose Luis', role: 'Head of Household', age: 45, address: 'Blk 4, 10th Street, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 7, name: 'Liza Mendoza', role: 'Member of Household', age: 38, address: 'Blk 3, 7th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 8, name: 'Alfredo Cruz', role: 'Head of Household', age: 52, address: 'Blk 2, 5th Avenue, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 9, name: 'Rosalinda Reyes', role: 'Member of Household', age: 30, address: 'Blk 6, 9th Avenue, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 10, name: 'Carlos Santos', role: 'Head of Household', age: 47, address: 'Blk 8, 14th Street, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 11, name: 'Fely Cruz', role: 'Member of Household', age: 24, address: 'Blk 5, Tandang Sora St., San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 12, name: 'Eduardo Garcia', role: 'Head of Household', age: 41, address: 'Blk 7, 12th Street, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 13, name: 'Mayra Dizon', role: 'Member of Household', age: 29, address: 'Blk 4, 15th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 14, name: 'Emilio Reyes', role: 'Head of Household', age: 49, address: 'Blk 9, 11th Avenue, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 15, name: 'Nina Velasquez', role: 'Member of Household', age: 32, address: 'Blk 10, 6th Avenue, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 16, name: 'Victor Palma', role: 'Head of Household', age: 55, address: 'Blk 11, Congressional Ave, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 17, name: 'Marina Suarez', role: 'Member of Household', age: 43, address: 'Blk 1, 12th Street, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 18, name: 'Juanito Espino', role: 'Head of Household', age: 58, address: 'Blk 6, 9th Avenue, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 19, name: 'Catherine Ramirez', role: 'Member of Household', age: 26, address: 'Blk 2, 5th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 20, name: 'Ricardo Garcia', role: 'Head of Household', age: 41, address: 'Blk 4, 7th Street, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 21, name: 'Gloria Mendoza', role: 'Member of Household', age: 36, address: 'Blk 8, 11th Street, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 22, name: 'Alfonso Navarro', role: 'Head of Household', age: 48, address: 'Blk 7, 14th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 23, name: 'Tess Martinez', role: 'Member of Household', age: 34, address: 'Blk 3, 8th Avenue, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 24, name: 'Luis Gomez', role: 'Head of Household', age: 52, address: 'Blk 9, 15th Avenue, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 25, name: 'Maria Luisa Aquino', role: 'Member of Household', age: 41, address: 'Blk 5, 13th Street, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 26, name: 'Ramon Santiago', role: 'Head of Household', age: 46, address: 'Blk 2, 16th Avenue, San Bartolome, Novaliches, QC', purok: 2, status: 'Verified' },
      { id: 27, name: 'Sofia Fernandez', role: 'Member of Household', age: 39, address: 'Blk 1, 10th Street, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' },
      { id: 28, name: 'Nina Palacios', role: 'Member of Household', age: 33, address: 'Blk 6, 14th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 29, name: 'Josefa Ramos', role: 'Head of Household', age: 58, address: 'Blk 8, 10th Avenue, San Bartolome, Novaliches, QC', purok: 1, status: 'Verified' },
      { id: 30, name: 'Carlos Molina', role: 'Member of Household', age: 27, address: 'Blk 4, 5th Street, San Bartolome, Novaliches, QC', purok: 3, status: 'Verified' }
    ]
  };
};