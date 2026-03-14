import React, { useEffect, useState } from 'react';

/**
 * Helper to pick a random item from an array
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const getRandomTestData = () => {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  const randomText = Math.random().toString(36).substring(2, 7);
  const randomPhone = "09" + Math.floor(100000000 + Math.random() * 900000000).toString();

  const firstNames = ["Juan", "Maria", "Pedro", "Elena", "Ricardo", "Liza", "Antonio", "Sonia", "Carlos", "Ana"];
  const lastNames = ["Dela Cruz", "Santos", "Reyes", "Bautista", "Garcia", "Mendoza", "Pascual", "Lopez", "Torres", "Rivera"];
  const middleNames = ["Protacio", "Silang", "Luna", "Mabini", "Aquino", "Dela Cruz", "Santos", "Reyes", "Bautista", "Garcia"];
  
  const occupations = ["Web Developer", "Teacher", "Nurse", "Sales Agent", "Driver", "Engineer", "Accountant", "Farmer", "Fisherman", "Vendor"];
  
  const educStats = ['Currently Studying', 'Graduated', 'Not Studying', 'N/A'];
  const schoolLevels = ['Pre-School', 'Elementary', 'Junior High School', 'Senior High School', 'College', 'Vocational', 'Masteral', 'N/A'];
  const incomeSources = ['Employment', 'Business', 'Remittance', 'Investments', 'Others', 'N/A'];
  const incomeBrackets = ['Below 10,000', '10,000 - 20,000', '20,001 - 30,000', '30,001 - 50,000', 'Above 50,000', 'N/A'];
  
  const tenures = ["Owned", "Rented", "Living with Parents", "Informal Settler"];
  const walls = ["Concrete", "Wood", "Half-Concrete", "Makeshift"];
  const roofs = ["G.I. Sheet", "Nipa", "Tile", "Concrete Slab"];
  const water = ["Tap Water", "Deep Well", "Mineral/Bought", "Spring"];

  return {
    firstName: pickRandom(firstNames),
    lastName: pickRandom(lastNames),
    middleName: pickRandom(middleNames),
    suffix: Math.random() > 0.8 ? "Jr." : "",
    birthdate: `19${Math.floor(Math.random() * 30) + 70}-0${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 20) + 10}`,
    birthRegistration: "Registered",
    gender: Math.random() > 0.5 ? "Male" : "Female",
    contact: randomPhone,
    email: `${randomText}${randomNum}@gmail.com`,
    
    purok: "1", 
    street: "1", 
    houseNumber: `${randomNum}-A`,

    householdPosition: "Son",
    maritalStatus: "1", 
    sector: "7", 
    residencyStatus: "Old Resident",
    residencyStartDate: "2015-01-01",
    nationality: "Filipino",
    isVoter: "1",

    employmentStatus: "Employed",
    occupation: pickRandom(occupations),
    incomeSource: pickRandom(incomeSources),
    monthlyIncome: pickRandom(incomeBrackets),
    educationalStatus: pickRandom(educStats),
    schoolType: Math.random() > 0.5 ? "Public" : "Private",
    schoolLevel: pickRandom(schoolLevels),
    highestGrade: "N/A",

    tenureStatus: pickRandom(tenures),
    wallMaterial: pickRandom(walls),
    roofMaterial: pickRandom(roofs),
    waterSource: pickRandom(water),
    

    isStaffMode: true 
  };
};

/**
 * FIXED DebugAutofill Component
 */
export const DebugAutofill = ({ setFormData: propsSetFormData }) => {

  const [internalSetter, setInternalSetter] = useState(null);

  useEffect(() => {
   
    if (propsSetFormData) {
      setInternalSetter(() => propsSetFormData);
    }


    const handleRegister = (e) => {
      if (typeof e.detail === 'function' || e.detail === null) {
        setInternalSetter(() => e.detail);
      }
    };

    window.addEventListener('REGISTER_SETTER', handleRegister);

    window.dispatchEvent(new CustomEvent('REQUEST_SETTER_REFRESH'));

    return () => window.removeEventListener('REGISTER_SETTER', handleRegister);
  }, [propsSetFormData]);

  const handleAutofill = () => {
    const activeSetter = internalSetter || propsSetFormData;

    if (!activeSetter) {
      console.warn("⚠️ No form setter found. Make sure the component is broadcasting REGISTER_SETTER.");
      alert("No active form detected! Click the form or refresh the page.");
      return;
    }

    const data = getRandomTestData();
    activeSetter((prev) => ({
      ...prev,
      ...data
    }));
    
    console.log("%c⚡ Random Data Injected!", "color: #22c55e; font-weight: bold; font-size: 12px;", data);
  };

  if (!internalSetter && !propsSetFormData) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] group">
      {/* Tooltip */}
      <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap font-bold border border-rose-500 shadow-xl transform translate-y-2 group-hover:translate-y-0">
        GENERATE RANDOM RESIDENT ⚡
      </div>
      
      {/* Main Button */}
     <button
  onClick={handleAutofill}
  type="button"
  className="-translate-x-14 bg-rose-600 hover:bg-rose-700 hover:scale-110 active:scale-95 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center justify-center transition-all border-2 border-white/30"
>
  <span className="font-black text-[10px] tracking-tighter">FILL</span>
</button>
    </div>
  );  
};

export default DebugAutofill;