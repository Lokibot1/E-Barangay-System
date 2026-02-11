/**
 * translateToTagalogService.js
 *
 * Centralized translation service for English / Tagalog.
 * All UI strings are organized by component/section for easy lookup.
 *
 * Usage:
 *   import { getTranslations, getLanguage, setLanguage } from ".../translateToTagalogService";
 *   const tr = getTranslations();     // returns object for current language
 *   const tr = getTranslations("tl"); // returns Tagalog translations
 */

const STORAGE_KEY = "appLanguage";
const DEFAULT_LANGUAGE = "en";

// ─── Language helpers ────────────────────────────────────────────────────────

export const getLanguage = () =>
  localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;

export const setLanguage = (lang) => {
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }));
};

export const toggleLanguage = () => {
  const next = getLanguage() === "en" ? "tl" : "en";
  setLanguage(next);
  return next;
};

// ─── Translations ────────────────────────────────────────────────────────────

const translations = {
  // ════════════════════════════════════════════════════════════════════════════
  //  ENGLISH
  // ════════════════════════════════════════════════════════════════════════════
  en: {
    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      reportUpdates: "Report Updates",
      active: "Active",
      viewAllNotifications: "View All Notifications",
      changeTheme: "Change Theme",
      privacySettings: "Privacy Settings",
      language: "Language",
      english: "English",
      tagalog: "Tagalog",
      viewProfile: "View Profile",
      logout: "Logout",
      incidentReporting: "Incident Reporting System",
    },

    // ── Sidebar ─────────────────────────────────────────────────────────────
    sidebar: {
      incidentReporting: "Incident Reporting",
      adminPanel: "Admin Panel",
      eBarangaySystem: "E-Barangay System",
      main: "Main",
      subsystem1: "Subsystem 1",
      subsystem2: "Subsystem 2",
      incidentComplaint: "Incident & Complaint",
      fileComplaint: "File a Complaint",
      reportIncident: "Report an Incident",
      incidentMap: "Incident Map",
      caseManagement: "Case Management",
      dashboard: "Dashboard",
      residents: "Residents",
      request: "Request",
      incidents: "Incidents",
      appointments: "Appointments",
      payments: "Payments",
      reports: "Reports",
      userManagement: "User Management",
      settings: "Settings",
    },

    // ── Main Page ───────────────────────────────────────────────────────────
    mainPage: {
      title: "INCIDENT & COMPLAINT MANAGEMENT",
    },

    // ── Main Menu Cards ─────────────────────────────────────────────────────
    menuCards: {
      fileComplaint: "FILE A COMPLAINT",
      reportIncident: "REPORT AN INCIDENT",
      incidentMap: "INCIDENT MAP",
      incidentStatus: "INCIDENT & COMPLAINT STATUS",
    },

    // ── File Complaint Page ─────────────────────────────────────────────────
    fileComplaintPage: {
      title: "FILING A COMPLAINT",
      whatHappens: "WHAT HAPPENS WHEN YOU FILE A COMPLAINT?",
      whatHappensDesc:
        'Filing a formal complaint (<strong>Blotter</strong>) initiates a community-based dispute resolution process. Its primary goal is Amicable Settlement\u2014helping both parties reach a fair agreement without going to court.',
      howProcessWorks: "HOW THE PROCESS WORKS?",
      step1Title: "DOCUMENTATION",
      step1Desc:
        "Your narration will be recorded in the official Barangay Blotter. This serves as a permanent administrative record of the incident.",
      step2Title: "THE SUMMONS",
      step2Desc:
        "Within the next few days, the Barangay will issue a Notice to Appear (Summons) to the person you are complaining against (the Respondent).",
      step3Title: "MEDIATION",
      step3Desc:
        "You and the Respondent will be invited to a face-to-face meeting moderated by the Barangay Captain or a member of the Lupon Tagapamayapa.",
      step4Title: "RESOLUTION / AGREEMENT",
      step4Desc:
        "If you settle, a written agreement is signed. This has the force and effect of a court judgment.",
      step4NoAgreement:
        "<strong>No Agreement:</strong> If no settlement is reached, the Barangay will issue a Certificate to File Action (CFA). You need this document if you decide to escalate the case to a higher court or the police.",
      whatToPrepare: "WHAT TO PREPARE?",
      facts: "FACTS",
      factsDesc:
        "Clear details of the date, time, and location of the incident.",
      names: "NAMES",
      namesDesc:
        "Full names and addresses of the parties involved (if known).",
      evidence: "EVIDENCE",
      evidenceDesc:
        "Photos, videos, screenshots, or names of witnesses that can support your statement.",
      ctaButton: "FILE A COMPLAINT",
      footer:
        "Barangay Incident & Complaint Management System. All rights reserved.",
    },

    // ── Incident Report Page ────────────────────────────────────────────────
    incidentReportPage: {
      title: "REPORT A COMMUNITY INCIDENT",
      heroTitle: "HELP US MAINTAIN ORDER AND SAFETY IN OUR STREETS.",
      heroDesc:
        "Use this platform to alert the Barangay about non-emergency incidents occurring in public spaces. Your report allows our response teams (Tanods and BDRRM) to address community concerns quickly.",
      whatToReport: "WHAT TO REPORT?",
      publicSafety: "PUBLIC SAFETY & TRAFFIC",
      publicSafetyDesc:
        "Illegal parking, street obstructions, or abandoned vehicles.",
      publicNuisance: "PUBLIC NUISANCE",
      publicNuisanceDesc:
        "Excessive noise, stray/aggressive animals, or broken public facilities.",
      environmental: "ENVIRONMENTAL HAZARDS",
      environmentalDesc:
        "Sudden flooding, illegal dumping of waste, or clogged sewers.",
      health: "HEALTH HAZARDS",
      healthDesc: "Standing water (dengue risk) or unsanitary public areas.",
      howToFile: "HOW TO FILE?",
      pinLocation: "PIN THE LOCATION",
      pinLocationDesc:
        "Use the map to mark the exact spot where the incident is happening.",
      provideDesc: "PROVIDE A BRIEF DESCRIPTION",
      provideDescDesc:
        "Tell us what is happening and how long it has been occurring.",
      attachProof: "ATTACH PROOF",
      attachProofDesc:
        "A clear photo of the violation (like a vehicle's license plate or the flooded street) is essential for validation.",
      ctaButton: "REPORT AN INCIDENT",
      footer:
        "Barangay Incident & Complaint Management System. All rights reserved.",
    },

    // ── Complaint Form ──────────────────────────────────────────────────────
    complaintForm: {
      step1Title: "Basic Information",
      step1Subtitle: "When and where did this occur?",
      dateOfIncident: "Date of Incident",
      timeOfIncident: "Time of Incident",
      location: "Location / Address",
      locationPlaceholder: "e.g., Block 5 Lot 10, Street Name, Barangay",
      step2Title: "Complaint Details",
      step2Subtitle: "Describe the nature of your complaint",
      complaintType: "Type of Complaint",
      selectComplaintType: "Select complaint type",
      noise: "Noise Disturbance",
      property: "Property Dispute",
      harassment: "Harassment",
      trespassing: "Trespassing",
      parking: "Illegal Parking",
      garbage: "Garbage/Sanitation Issue",
      boundary: "Boundary Dispute",
      unpaid: "Unpaid Debt",
      other: "Other",
      severity: "Severity Level",
      selectSeverity: "Select severity",
      severityLow: "Low - Minor issue",
      severityMedium: "Medium - Moderate concern",
      severityHigh: "High - Urgent attention needed",
      description: "Detailed Description",
      descriptionPlaceholder:
        "Please provide a clear and detailed account of what happened...",
      step3Title: "Parties Involved",
      step3Subtitle: "Information about complainant and respondent",
      complainantYou: "Complainant (You)",
      fullName: "Full Name",
      yourFullName: "Your full name",
      contactNumber: "Contact Number",
      respondent: "Respondent",
      respondentName: "Name of the person",
      respondentAddress: "Address (if known)",
      respondentAddressPlaceholder: "Respondent's address or location",
      witnesses: "Witnesses (Optional)",
      witnessPlaceholder: "Witness",
      addWitness: "+ Add Another Witness",
      step4Title: "Additional Information",
      step4Subtitle: "Supporting documents and desired resolution",
      desiredResolution: "Desired Resolution",
      desiredResolutionPlaceholder:
        "What outcome are you seeking? (e.g., apology, compensation, cease of activity)",
      additionalNotes: "Additional Notes (Optional)",
      additionalNotesPlaceholder:
        "Any other information you'd like to add...",
      supportingDocuments: "Supporting Documents",
      supportingDocumentsDesc:
        "Upload any photos, videos, or documents that support your complaint",
    },

    // ── Complaint Modal ─────────────────────────────────────────────────────
    complaintModal: {
      title: "File a Complaint",
      subtitle: "Submit your complaint for barangay mediation",
      previous: "\u2190 Previous",
      next: "Next \u2192",
      step: "Step",
      of: "of",
      submit: "\u2713 Submit Complaint",
      submitting: "Submitting...",
      successTitle: "Complaint Submitted!",
      successMessage:
        "Your complaint has been recorded and will be processed by the Barangay.",
      errorSessionTitle: "Session Expired",
      errorSessionMessage: "Please log in again to continue.",
      errorTitle: "Submission Failed",
      errorMessage: "Something went wrong. Please try again.",
      dateRequired: "Date of complaint is required.",
      dateFuture: "Date cannot be in the future.",
      timeRequired: "Time of complaint is required.",
      locationRequired: "Location is required.",
      typeRequired: "Please select a complaint type.",
      severityRequired: "Please select a severity level.",
      descriptionRequired: "A detailed description is required.",
      complainantRequired: "Complainant name is required.",
      respondentRequired: "Respondent name is required.",
    },

    // ── Incident Form ───────────────────────────────────────────────────────
    incidentForm: {
      step1Title: "Basic Information",
      dateOfIncident: "Date of Incident",
      timeOfIncident: "Time of Incident",
      location: "Location of Incident",
      locationPlaceholder: "Building, floor, room number, or specific area",
      step2Title: "Incident Details",
      incidentType: "Type of Incident",
      selectIncidentType: "Select incident type",
      safety: "Safety Incident",
      security: "Security Breach",
      environmental: "Environmental Hazard",
      equipment: "Equipment Failure",
      workplaceViolence: "Workplace Violence",
      fire: "Fire / Evacuation",
      accident: "Accident / Injury",
      nearMiss: "Near Miss",
      other: "Other",
      severity: "Severity Level",
      selectSeverity: "Select severity level",
      severityLow: "Low - Minor incident, no injuries",
      severityMedium: "Medium - Moderate impact, minor injuries",
      severityHigh: "High - Serious incident, significant damage",
      severityCritical: "Critical - Life-threatening, major damage",
      description: "Detailed Description",
      descriptionPlaceholder:
        "Describe what happened, including the sequence of events, circumstances, and any contributing factors...",
      immediateAction: "Immediate Action Taken",
      immediateActionPlaceholder:
        "Describe any immediate actions taken to address the incident...",
      step3Title: "People Involved",
      personsInvolved: "Persons Involved",
      personPlaceholder: "Person",
      addPerson: "Add Person",
      witnesses: "Witnesses",
      witnessPlaceholder: "Witness",
      addWitness: "Add Witness",
      impactAssessment: "Impact Assessment",
      injuries: "Were there any injuries?",
      propertyDamage: "Was there property damage?",
      medicalAttention: "Was medical attention required?",
      step4Title: "Additional Information",
      attachments: "Attachments",
      attachmentsDesc:
        "Upload photos, videos, or documents related to the incident (Max 10MB per file)",
      additionalNotes: "Additional Notes",
      additionalNotesPlaceholder:
        "Any other relevant information, recommendations, or comments...",
      reviewTitle: "Review Before Submitting",
      reviewDesc:
        "Please review all information carefully. Once submitted, this report will be sent to the safety team for investigation.",
    },

    // ── Incident Report Modal ───────────────────────────────────────────────
    incidentModal: {
      title: "Incident Report",
      subtitle: "Provide detailed information about the incident",
      previous: "\u2190 Previous",
      next: "Next \u2192",
      step: "Step",
      of: "of",
      submit: "\u2713 Submit Report",
      submitting: "Submitting...",
      successTitle: "Report Submitted!",
      successMessage:
        "Your incident report has been recorded and will be reviewed shortly.",
      errorTitle: "Submission Failed",
      errorMessage: "Something went wrong. Please try again.",
      dateRequired: "Date of incident is required.",
      dateFuture: "Date cannot be in the future.",
      timeRequired: "Time of incident is required.",
      locationRequired: "Location is required.",
      typeRequired: "Please select an incident type.",
      severityRequired: "Please select a severity level.",
      descriptionRequired: "A detailed description is required.",
      personsRequired: "At least one person involved is required.",
      witnessesRequired: "At least one witness is required.",
    },

    // ── Logout Modal ────────────────────────────────────────────────────────
    logoutModal: {
      title: "Confirm Logout",
      message:
        "Are you sure you want to sign out? You will need to log in again to access the system.",
      cancel: "Cancel",
      confirm: "Yes, Logout",
      loggingOut: "Logging out...",
    },

    // ── Theme Modal ─────────────────────────────────────────────────────────
    themeModal: {
      title: "Choose Your Theme",
      subtitle: "Customize the appearance of your workspace",
      selected: "Selected",
      oceanBlue: "Ocean Blue",
      oceanBlueDesc: "Professional and calming",
      royalPurple: "Royal Purple",
      royalPurpleDesc: "Creative and elegant",
      forestGreen: "Forest Green",
      forestGreenDesc: "Natural and refreshing",
      darkMode: "Dark Mode",
      darkModeDesc: "Easy on the eyes",
      previewNote: "Theme Preview",
      previewDesc:
        "The selected theme will be applied to your entire workspace, including buttons, cards, and navigation elements.",
      cancel: "Cancel",
      apply: "Apply Theme",
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  //  TAGALOG
  // ════════════════════════════════════════════════════════════════════════════
  tl: {
    header: {
      reportUpdates: "Mga Update ng Ulat",
      active: "Aktibo",
      viewAllNotifications: "Tingnan Lahat ng Abiso",
      changeTheme: "Baguhin ang Tema",
      privacySettings: "Mga Setting ng Privacy",
      language: "Wika",
      english: "Ingles",
      tagalog: "Tagalog",
      viewProfile: "Tingnan ang Profile",
      logout: "Mag-logout",
      incidentReporting: "Sistema ng Pag-uulat ng Insidente",
    },

    sidebar: {
      incidentReporting: "Pag-uulat ng Insidente",
      adminPanel: "Panel ng Admin",
      eBarangaySystem: "Sistema ng E-Barangay",
      main: "Pangunahin",
      subsystem1: "Subsystem 1",
      subsystem2: "Subsystem 2",
      incidentComplaint: "Insidente at Reklamo",
      fileComplaint: "Maghain ng Reklamo",
      reportIncident: "Mag-ulat ng Insidente",
      incidentMap: "Mapa ng Insidente",
      caseManagement: "Pamamahala ng Kaso",
      dashboard: "Dashboard",
      residents: "Mga Residente",
      request: "Kahilingan",
      incidents: "Mga Insidente",
      appointments: "Mga Appointment",
      payments: "Mga Bayarin",
      reports: "Mga Ulat",
      userManagement: "Pamamahala ng User",
      settings: "Mga Setting",
    },

    mainPage: {
      title: "PAMAMAHALA NG INSIDENTE AT REKLAMO",
    },

    menuCards: {
      fileComplaint: "MAGHAIN NG REKLAMO",
      reportIncident: "MAG-ULAT NG INSIDENTE",
      incidentMap: "MAPA NG INSIDENTE",
      incidentStatus: "KATAYUAN NG INSIDENTE AT REKLAMO",
    },

    fileComplaintPage: {
      title: "PAGHAHAIN NG REKLAMO",
      whatHappens: "ANO ANG MANGYAYARI KAPAG NAGHAIN KA NG REKLAMO?",
      whatHappensDesc:
        'Ang paghahain ng pormal na reklamo (<strong>Blotter</strong>) ay magsisimula ng proseso ng paglutas ng alitan sa komunidad. Ang pangunahing layunin nito ay Mapayapang Kasunduan\u2014matulungan ang dalawang panig na makamit ang patas na kasunduan nang hindi pumupunta sa korte.',
      howProcessWorks: "PAANO ANG PROSESO?",
      step1Title: "DOKUMENTASYON",
      step1Desc:
        "Ang iyong salaysay ay itatala sa opisyal na Barangay Blotter. Ito ay nagsisilbing permanenteng rekord ng insidente.",
      step2Title: "ANG PATAWAG",
      step2Desc:
        "Sa loob ng ilang araw, ang Barangay ay mag-iisyu ng Abiso na Humarap (Patawag) sa taong iyong inirereklamo (ang Respondent).",
      step3Title: "MEDYASYON",
      step3Desc:
        "Kayo ng Respondent ay iimbitahan sa isang harap-harapang pagpupulong na pinapangasiwaan ng Barangay Captain o isang miyembro ng Lupon Tagapamayapa.",
      step4Title: "RESOLUSYON / KASUNDUAN",
      step4Desc:
        "Kung magkakasundo, pipirmahan ang isang nakasulat na kasunduan. Ito ay may bisa at epekto ng hatol ng korte.",
      step4NoAgreement:
        "Walang Kasunduan: Kung walang napagkasunduan, ang Barangay ay mag-iisyu ng Certificate to File Action (CFA). Kailangan mo ang dokumentong ito kung magpapasya kang iakyat ang kaso sa mas mataas na hukuman o sa pulisya.",
      whatToPrepare: "ANO ANG DAPAT IHANDA?",
      facts: "MGA KATOTOHANAN",
      factsDesc:
        "Malinaw na detalye ng petsa, oras, at lokasyon ng insidente.",
      names: "MGA PANGALAN",
      namesDesc: "Buong pangalan at tirahan ng mga sangkot (kung alam).",
      evidence: "MGA EBIDENSYA",
      evidenceDesc:
        "Mga litrato, video, screenshot, o pangalan ng mga saksi na makakasuporta sa iyong pahayag.",
      ctaButton: "MAGHAIN NG REKLAMO",
      footer:
        "Sistema ng Pamamahala ng Insidente at Reklamo ng Barangay. Lahat ng karapatan ay nakalaan.",
    },

    incidentReportPage: {
      title: "MAG-ULAT NG INSIDENTE SA KOMUNIDAD",
      heroTitle:
        "TULUNGAN KAMING PANATILIHIN ANG KAAYUSAN AT KALIGTASAN SA ATING MGA KALYE.",
      heroDesc:
        "Gamitin ang platform na ito upang alertuhan ang Barangay tungkol sa mga hindi-emerhensiyang insidente sa mga pampublikong lugar. Ang iyong ulat ay nagbibigay-daan sa aming mga response team (Tanod at BDRRM) na matugunan ang mga alalahanin ng komunidad nang mabilis.",
      whatToReport: "ANO ANG DAPAT IULAT?",
      publicSafety: "KALIGTASANG PUBLIKO AT TRAPIKO",
      publicSafetyDesc:
        "Ilegal na paradahan, harang sa kalsada, o mga inabandunang sasakyan.",
      publicNuisance: "ABALA SA PUBLIKO",
      publicNuisanceDesc:
        "Labis na ingay, mga gala/agresibong hayop, o mga sirang pampublikong pasilidad.",
      environmental: "MGA PANGANIB SA KAPALIGIRAN",
      environmentalDesc:
        "Biglaang pagbaha, ilegal na pagtatapon ng basura, o baradong imburnal.",
      health: "MGA PANGANIB SA KALUSUGAN",
      healthDesc:
        "Nakatigil na tubig (panganib ng dengue) o hindi malinis na mga pampublikong lugar.",
      howToFile: "PAANO MAG-FILE?",
      pinLocation: "I-PIN ANG LOKASYON",
      pinLocationDesc:
        "Gamitin ang mapa upang markahan ang eksaktong lugar kung saan nangyayari ang insidente.",
      provideDesc: "MAGBIGAY NG MAIKLING PAGLALARAWAN",
      provideDescDesc:
        "Sabihin sa amin kung ano ang nangyayari at gaano na ito katagal.",
      attachProof: "MAG-ATTACH NG EBIDENSYA",
      attachProofDesc:
        "Mahalaga ang malinaw na larawan ng paglabag (tulad ng plaka ng sasakyan o binabahang kalye) para sa pagpapatunay.",
      ctaButton: "MAG-ULAT NG INSIDENTE",
      footer:
        "Sistema ng Pamamahala ng Insidente at Reklamo ng Barangay. Lahat ng karapatan ay nakalaan.",
    },

    complaintForm: {
      step1Title: "Pangunahing Impormasyon",
      step1Subtitle: "Kailan at saan ito naganap?",
      dateOfIncident: "Petsa ng Insidente",
      timeOfIncident: "Oras ng Insidente",
      location: "Lokasyon / Tirahan",
      locationPlaceholder: "hal., Block 5 Lot 10, Pangalan ng Kalye, Barangay",
      step2Title: "Mga Detalye ng Reklamo",
      step2Subtitle: "Ilarawan ang uri ng iyong reklamo",
      complaintType: "Uri ng Reklamo",
      selectComplaintType: "Pumili ng uri ng reklamo",
      noise: "Kaguluhan sa Ingay",
      property: "Alitan sa Ari-arian",
      harassment: "Panliligalig",
      trespassing: "Pagpasok sa Pribadong Ari-arian",
      parking: "Ilegal na Paradahan",
      garbage: "Problema sa Basura/Sanitasyon",
      boundary: "Alitan sa Hangganan",
      unpaid: "Hindi Nabayarang Utang",
      other: "Iba Pa",
      severity: "Antas ng Kalubhaan",
      selectSeverity: "Pumili ng kalubhaan",
      severityLow: "Mababa - Maliit na isyu",
      severityMedium: "Katamtaman - Katamtamang alalahanin",
      severityHigh: "Mataas - Kailangang madaliang tugunan",
      description: "Detalyadong Paglalarawan",
      descriptionPlaceholder:
        "Mangyaring magbigay ng malinaw at detalyadong salaysay ng nangyari...",
      step3Title: "Mga Sangkot na Partido",
      step3Subtitle: "Impormasyon tungkol sa nagreklamo at respondent",
      complainantYou: "Nagreklamo (Ikaw)",
      fullName: "Buong Pangalan",
      yourFullName: "Iyong buong pangalan",
      contactNumber: "Numero ng Telepono",
      respondent: "Respondent",
      respondentName: "Pangalan ng tao",
      respondentAddress: "Tirahan (kung alam)",
      respondentAddressPlaceholder: "Tirahan o lokasyon ng respondent",
      witnesses: "Mga Saksi (Opsyonal)",
      witnessPlaceholder: "Saksi",
      addWitness: "+ Magdagdag ng Saksi",
      step4Title: "Karagdagang Impormasyon",
      step4Subtitle: "Mga sumusuportang dokumento at ninanais na resolusyon",
      desiredResolution: "Ninanais na Resolusyon",
      desiredResolutionPlaceholder:
        "Ano ang hinahanap mong resulta? (hal., paghingi ng tawad, kabayaran, paghinto ng aktibidad)",
      additionalNotes: "Karagdagang Tala (Opsyonal)",
      additionalNotesPlaceholder:
        "Anumang iba pang impormasyon na nais mong idagdag...",
      supportingDocuments: "Mga Sumusuportang Dokumento",
      supportingDocumentsDesc:
        "Mag-upload ng mga litrato, video, o dokumento na sumusuporta sa iyong reklamo",
    },

    complaintModal: {
      title: "Maghain ng Reklamo",
      subtitle: "Isumite ang iyong reklamo para sa medyasyon ng barangay",
      previous: "\u2190 Nakaraan",
      next: "Susunod \u2192",
      step: "Hakbang",
      of: "ng",
      submit: "\u2713 Isumite ang Reklamo",
      submitting: "Isinusumite...",
      successTitle: "Naisumite na ang Reklamo!",
      successMessage:
        "Ang iyong reklamo ay naitala na at ipoproseso ng Barangay.",
      errorSessionTitle: "Nag-expire ang Session",
      errorSessionMessage: "Mangyaring mag-login muli upang magpatuloy.",
      errorTitle: "Nabigo ang Pagsusumite",
      errorMessage: "May nangyaring mali. Mangyaring subukan muli.",
      dateRequired: "Kinakailangan ang petsa ng reklamo.",
      dateFuture: "Hindi maaaring nasa hinaharap ang petsa.",
      timeRequired: "Kinakailangan ang oras ng reklamo.",
      locationRequired: "Kinakailangan ang lokasyon.",
      typeRequired: "Mangyaring pumili ng uri ng reklamo.",
      severityRequired: "Mangyaring pumili ng antas ng kalubhaan.",
      descriptionRequired: "Kinakailangan ang detalyadong paglalarawan.",
      complainantRequired: "Kinakailangan ang pangalan ng nagreklamo.",
      respondentRequired: "Kinakailangan ang pangalan ng respondent.",
    },

    incidentForm: {
      step1Title: "Pangunahing Impormasyon",
      dateOfIncident: "Petsa ng Insidente",
      timeOfIncident: "Oras ng Insidente",
      location: "Lokasyon ng Insidente",
      locationPlaceholder: "Gusali, palapag, numero ng silid, o tiyak na lugar",
      step2Title: "Mga Detalye ng Insidente",
      incidentType: "Uri ng Insidente",
      selectIncidentType: "Pumili ng uri ng insidente",
      safety: "Insidente sa Kaligtasan",
      security: "Paglabag sa Seguridad",
      environmental: "Panganib sa Kapaligiran",
      equipment: "Sira ng Kagamitan",
      workplaceViolence: "Karahasan sa Trabaho",
      fire: "Sunog / Ebakwasyon",
      accident: "Aksidente / Pinsala",
      nearMiss: "Halos Aksidente",
      other: "Iba Pa",
      severity: "Antas ng Kalubhaan",
      selectSeverity: "Pumili ng antas ng kalubhaan",
      severityLow: "Mababa - Maliit na insidente, walang sugatan",
      severityMedium: "Katamtaman - Katamtamang epekto, maliit na sugat",
      severityHigh: "Mataas - Seryosong insidente, malaking pinsala",
      severityCritical: "Kritikal - Nakamamatay, malaking pinsala",
      description: "Detalyadong Paglalarawan",
      descriptionPlaceholder:
        "Ilarawan kung ano ang nangyari, kasama ang pagkakasunud-sunod ng mga pangyayari, mga kalagayan, at mga nakapag-ambag na kadahilanan...",
      immediateAction: "Agarang Aksyong Ginawa",
      immediateActionPlaceholder:
        "Ilarawan ang anumang agarang aksyong ginawa upang tugunan ang insidente...",
      step3Title: "Mga Taong Sangkot",
      personsInvolved: "Mga Taong Sangkot",
      personPlaceholder: "Tao",
      addPerson: "Magdagdag ng Tao",
      witnesses: "Mga Saksi",
      witnessPlaceholder: "Saksi",
      addWitness: "Magdagdag ng Saksi",
      impactAssessment: "Pagtatasa ng Epekto",
      injuries: "May nasaktan ba?",
      propertyDamage: "May nasira bang ari-arian?",
      medicalAttention: "Kailangan ba ng atensyong medikal?",
      step4Title: "Karagdagang Impormasyon",
      attachments: "Mga Kalakip",
      attachmentsDesc:
        "Mag-upload ng mga litrato, video, o dokumento na may kaugnayan sa insidente (Max 10MB bawat file)",
      additionalNotes: "Karagdagang Tala",
      additionalNotesPlaceholder:
        "Anumang iba pang kaugnay na impormasyon, rekomendasyon, o komento...",
      reviewTitle: "Suriin Bago Isumite",
      reviewDesc:
        "Mangyaring suriin nang mabuti ang lahat ng impormasyon. Kapag naisumite na, ang ulat na ito ay ipapadala sa safety team para sa imbestigasyon.",
    },

    incidentModal: {
      title: "Ulat ng Insidente",
      subtitle: "Magbigay ng detalyadong impormasyon tungkol sa insidente",
      previous: "\u2190 Nakaraan",
      next: "Susunod \u2192",
      step: "Hakbang",
      of: "ng",
      submit: "\u2713 Isumite ang Ulat",
      submitting: "Isinusumite...",
      successTitle: "Naisumite na ang Ulat!",
      successMessage:
        "Ang iyong ulat ng insidente ay naitala na at susuriin sa lalong madaling panahon.",
      errorTitle: "Nabigo ang Pagsusumite",
      errorMessage: "May nangyaring mali. Mangyaring subukan muli.",
      dateRequired: "Kinakailangan ang petsa ng insidente.",
      dateFuture: "Hindi maaaring nasa hinaharap ang petsa.",
      timeRequired: "Kinakailangan ang oras ng insidente.",
      locationRequired: "Kinakailangan ang lokasyon.",
      typeRequired: "Mangyaring pumili ng uri ng insidente.",
      severityRequired: "Mangyaring pumili ng antas ng kalubhaan.",
      descriptionRequired: "Kinakailangan ang detalyadong paglalarawan.",
      personsRequired: "Kinakailangan ang kahit isang taong sangkot.",
      witnessesRequired: "Kinakailangan ang kahit isang saksi.",
    },

    logoutModal: {
      title: "Kumpirmahin ang Pag-logout",
      message:
        "Sigurado ka bang gusto mong mag-sign out? Kailangan mong mag-login muli upang ma-access ang sistema.",
      cancel: "Kanselahin",
      confirm: "Oo, Mag-logout",
      loggingOut: "Nagla-logout...",
    },

    themeModal: {
      title: "Pumili ng Tema",
      subtitle: "I-customize ang hitsura ng iyong workspace",
      selected: "Napili",
      oceanBlue: "Asul ng Karagatan",
      oceanBlueDesc: "Propesyonal at nakakapagpahinga",
      royalPurple: "Maharlikang Lila",
      royalPurpleDesc: "Malikhain at elegante",
      forestGreen: "Berdeng Kagubatan",
      forestGreenDesc: "Natural at nakakapag-refresh",
      darkMode: "Madilim na Mode",
      darkModeDesc: "Madali sa mata",
      previewNote: "Preview ng Tema",
      previewDesc:
        "Ang napiling tema ay ilalapat sa buong workspace mo, kasama ang mga button, card, at navigation element.",
      cancel: "Kanselahin",
      apply: "Ilapat ang Tema",
    },
  },
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the full translations object for the given (or current) language.
 * @param {string} [lang] - "en" or "tl". Falls back to stored preference.
 */
export const getTranslations = (lang) => {
  const key = lang || getLanguage();
  return translations[key] || translations.en;
};

export default translations;
