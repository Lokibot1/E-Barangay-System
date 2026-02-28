import {
  FileText,
  ShieldCheck,
  Users,
  Phone,
  Sun,
  Facebook,
  Instagram,
  Globe,
} from "lucide-react";

import vaccineDrivePic from "../../assets/images/vaccine-drive.jpg";
import digitalIdPic from "../../assets/images/digital-id.png";
import cleanupDrivePic from "../../assets/images/cleanup-drive.jpg";
import picture1 from "../../assets/images/reynaldo-rivera.jpg";
import picture2 from "../../assets/images/jose-santos.jpg";
import picture3 from "../../assets/images/maria-ramos.jpg";
import picture4 from "../../assets/images/carlos-garcia.jpg";
import picture5 from "../../assets/images/sofia-mercado.avif";

export const announcements = [
  {
    id: "vaccination-drive-2026-02-21",
    date: "Feb 21, 2026",
    tag: "Health",
    title: "Purok Vaccination Drive",
    desc: "Free health check-ups and flu vaccines available at the Barangay Hall medical center.",
    fullContent:
      "The Barangay Health Office, in partnership with the City Health Department, will conduct a mass vaccination drive. This initiative aims to protect our residents from seasonal flu and provide basic medical check-ups for seniors and children. Please bring your health card and a valid ID.",
    urgent: true,
    image: vaccineDrivePic,
  },
  {
    id: "digital-id-rollout-2026-02-18",
    date: "Feb 18, 2026",
    tag: "Advisory",
    title: "Digital ID Rollout",
    desc: "All residents are encouraged to register for the new Digital Resident ID for faster transactions.",
    fullContent:
      "Our new Digital Resident ID system is now live! This modern identification system will streamline the process of getting clearances, permits, and other barangay documents. Residents can register through this portal or visit the registration booth at the Barangay Hall lobby starting Monday.",
    urgent: false,
    image: digitalIdPic,
  },
  {
    id: "cleanup-drive-2026-02-15",
    date: "Feb 15, 2026",
    tag: "Community",
    title: "Clean-up Drive",
    desc: "Join our 'Tapat Ko, Linis Ko' initiative this Saturday starting at 6:00 AM.",
    fullContent:
      "Let's keep Barangay Gulod clean and green! We are inviting all residents to participate in our community-wide clean-up drive. Materials like trash bags and gloves will be provided by the barangay. We will meet at the Purok centers before heading to the main streets.",
    urgent: false,
    image: cleanupDrivePic,
  },
];

export const officeHours = {
  timezone: "Asia/Manila",
  weekday: { open: "08:00", close: "17:00" },
  saturday: { open: "08:00", close: "12:00" },
  closedDays: ["Sunday"],
};

export const upcomingEvents = [
  {
    id: "barangay-assembly-2026-02-28",
    date: "2026-02-28",
    startTime: "09:00 AM",
    endTime: "11:30 AM",
    title: "1st Quarter Barangay Assembly",
    category: "Governance",
    location: "Barangay Covered Court",
    details: "Community updates, budget highlights, and open forum.",
  },
  {
    id: "medical-mission-2026-03-05",
    date: "2026-03-05",
    startTime: "08:00 AM",
    endTime: "02:00 PM",
    title: "Medical and Dental Mission",
    category: "Health",
    location: "Barangay Hall Clinic",
    details: "Free blood pressure, glucose check, and dental consultation.",
  },
  {
    id: "livelihood-seminar-2026-03-12",
    date: "2026-03-12",
    startTime: "01:00 PM",
    endTime: "04:00 PM",
    title: "Livelihood Skills Seminar",
    category: "Livelihood",
    location: "Session Hall, 2nd Floor",
    details: "Training for food business basics and small business setup.",
  },
  {
    id: "cleanup-drive-2026-03-21",
    date: "2026-03-21",
    startTime: "06:00 AM",
    endTime: "10:00 AM",
    title: "Community Clean-Up Drive",
    category: "Community",
    location: "All Purok Assembly Points",
    details: "Bring reusable gloves and tumblers. Cleanup kits are provided.",
  },
];

export const faqItems = [
  {
    id: "faq-resident-id",
    question: "How do I apply for a Digital Resident ID?",
    answer:
      "Create an account, complete your profile, upload valid requirements, then wait for verification. You will be notified once approved.",
    tags: ["id", "registration", "digital id"],
  },
  {
    id: "faq-clearance-time",
    question: "How long is the processing time for Barangay Clearance?",
    answer:
      "Most requests are processed within 1 to 2 business days after verification and payment confirmation.",
    tags: ["clearance", "processing", "certificate"],
  },
  {
    id: "faq-requirements",
    question: "What requirements are needed for certificate requests?",
    answer:
      "Prepare a valid ID, proof of residency, and any additional supporting document depending on the certificate type.",
    tags: ["requirements", "residency", "documents"],
  },
  {
    id: "faq-track",
    question: "Where can I follow up my submitted request?",
    answer:
      "Log in to your portal account and check the request status panel. You can also ask support with your reference number.",
    tags: ["tracking", "status", "reference number"],
  },
  {
    id: "faq-office-hours",
    question: "What are the office hours of Barangay Gulod?",
    answer:
      "The office is open Monday to Friday from 8:00 AM to 5:00 PM and Saturday from 8:00 AM to 12:00 PM.",
    tags: ["office hours", "schedule", "open"],
  },
];

export const concernCategories = [
  "Road and Sidewalk",
  "Streetlight",
  "Drainage and Flooding",
  "Waste and Sanitation",
  "Peace and Order",
  "Other",
];

export const services = [
  {
    id: "e-certifications",
    icon: FileText,
    title: "E-Certifications",
    desc: "Apply for Clearance, Indigency, and Residency from your phone.",
    color: "text-blue-500",
  },
  {
    id: "resident-id",
    icon: ShieldCheck,
    title: "Resident ID",
    desc: "Secure digital identification for all verified Gulod residents.",
    color: "text-emerald-500",
  },
  {
    id: "social-services",
    icon: Users,
    title: "Social Services",
    desc: "Access health programs, financial aid, and community training.",
    color: "text-amber-500",
  },
];

export const officials = [
  {
    id: "reynaldo-rivera",
    name: "Hon. Reynaldo B. Rivera",
    role: "Punong Barangay",
    committee: "Administration & Finance",
    image: picture1,
  },
  {
    id: "jose-santos",
    name: "Hon. Jose M. Santos",
    role: "Barangay Kagawad",
    committee: "Peace & Order / Public Safety",
    image: picture2,
  },
  {
    id: "maria-ramos",
    name: "Hon. Maria A. Ramos",
    role: "Barangay Kagawad",
    committee: "Health & Social Services",
    image: picture3,
  },
  {
    id: "carlos-garcia",
    name: "Hon. Carlos P. Garcia",
    role: "Barangay Kagawad",
    committee: "Infrastructure & Education",
    image: picture4,
  },
  {
    id: "sofia-mercado",
    name: "Hon. Sofia L. Mercado",
    role: "SK Chairperson",
    committee: "Youth & Sports Development",
    image: picture5,
  },
];

export const emergencyHotlines = [
  { id: "rescue", label: "Rescue", phone: "0912-345-6789", icon: ShieldCheck },
  { id: "police", label: "Police", phone: "8-922-1234", icon: Users },
  { id: "fire", label: "Fire", phone: "8-911-0000", icon: Sun },
];

export const socialLinks = [
  { id: "facebook", label: "Facebook", href: "#", icon: Facebook },
  { id: "instagram", label: "Instagram", href: "#", icon: Instagram },
  { id: "website", label: "Website", href: "#", icon: Globe },
];

export const defaultChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Mabuhay! I am your Gulod Digital Assistant. How can I help you today?",
};

export const weatherConditions = ["Sunny", "Cloudy", "Fair"];

export const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
