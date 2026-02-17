/**
 * Rule-based Insights Engine for E-Barangay Incident & Complaint Analytics
 *
 * Analyzes incidents and complaints data to generate actionable insights
 * with severity levels and recommended actions.
 */

const SEVERITY = { CRITICAL: "critical", WARNING: "warning", INFO: "info" };

// Normalize status across both raw API and pre-normalized data
const normalizeStatus = (status) => {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (s === "pending" || s === "ongoing" || s === "in_progress") return "pending";
  if (s === "resolved" || s === "completed" || s === "closed") return "resolved";
  if (s === "rejected" || s === "dismissed" || s === "denied") return "rejected";
  if (s === "dispatched") return "dispatched";
  if (s === "active") return "active";
  return "pending";
};

// Extract a usable location string from a report
const getLocation = (report) => {
  // Pre-normalized format (from AdminIncidentReports)
  if (report.address) return report.address.trim().toLowerCase();
  // Raw API format
  if (report.location) return report.location.trim().toLowerCase();
  return "";
};

// Extract a usable date from a report
const getDate = (report) => {
  const raw = report.date || report.created_at || report.incident_date || "";
  return raw.split("T")[0];
};

// Extract type from a report
const getType = (report) => {
  // Pre-normalized string
  if (typeof report.type === "string" && report.type !== "") return report.type;
  // Raw API: types array
  if (report.types && Array.isArray(report.types)) {
    return report.types.map((t) => t.name).join(", ");
  }
  // Raw API: JSON-encoded type
  try {
    const parsed = JSON.parse(report.type);
    if (Array.isArray(parsed)) return parsed.join(", ");
    return String(parsed);
  } catch {
    return report.type || "Other";
  }
};

// Simplify address to street-level for clustering
const simplifyAddress = (addr) => {
  if (!addr) return "";
  // Remove barangay/city suffixes, house numbers, keep street name
  const cleaned = addr
    .replace(/,?\s*(barangay|brgy\.?|gulod|valenzuela|metro manila|philippines).*/gi, "")
    .replace(/^\d+\s*/, "")
    .trim();
  return cleaned || addr;
};

// ── Address-specific recommendation templates keyed by dominant type ──
const ADDRESS_RECOMMENDATIONS = {
  // Incident types
  "traffic & parking": (loc, count) =>
    `Deploy traffic enforcers or barangay tanods at ${loc} during peak hours. Consider installing traffic signs, speed bumps, or no-parking signages to reduce recurring traffic and parking violations (${count} report/s).`,
  "waste management": (loc, count) =>
    `Schedule a regular barangay clean-up drive at ${loc}. Coordinate with the city waste management office and post anti-littering signages in the area (${count} report/s).`,
  "roads & infrastructure": (loc, count) =>
    `File an infrastructure repair request with the City Engineering Office for ${loc}. Mark hazardous spots with warning signs until repairs are completed (${count} report/s).`,
  "draining & flooding": (loc, count) =>
    `Inspect and clear drainage systems at ${loc}. Coordinate with the city DRRM office for flood mitigation and advise nearby residents of precautionary measures (${count} report/s).`,
  "pollution": (loc, count) =>
    `Investigate pollution sources at ${loc} and coordinate with the DENR or City Environment Office. Issue notices to establishments or residents contributing to pollution in the area (${count} report/s).`,
  "stray animals": (loc, count) =>
    `Coordinate with the City Veterinary Office for an animal control operation at ${loc}. Remind pet owners in the area about responsible pet ownership ordinances (${count} report/s).`,
  // Complaint types
  "noise complaint": (loc, count) =>
    `Deploy barangay tanods to enforce noise ordinance at ${loc}, especially during nighttime hours. Issue verbal or written warnings to repeat violators (${count} report/s).`,
  "neighbor dispute": (loc, count) =>
    `Schedule a mediation or conciliation session at the Lupong Tagapamayapa for residents at ${loc}. Proactive community dialogue may prevent escalation (${count} report/s).`,
  "public disturbance": (loc, count) =>
    `Increase tanod patrols and visibility at ${loc} to deter public disturbances. Consider coordinating with the PNP for joint operations if disturbances persist (${count} report/s).`,
  "illegal activity": (loc, count) =>
    `Coordinate with the PNP and barangay intelligence network regarding reports of illegal activity at ${loc}. Increase surveillance and tanod presence in the area (${count} report/s).`,
  "property damage": (loc, count) =>
    `Document and investigate reported property damage cases at ${loc}. Assist affected residents in filing proper complaints and coordinate with authorities if vandalism is involved (${count} report/s).`,
};

const getAddressRecommendation = (location, dominantType, count) => {
  const key = dominantType.toLowerCase();
  const fn = ADDRESS_RECOMMENDATIONS[key];
  if (fn) return fn(location, count);
  // Fallback
  return `Deploy additional barangay tanods to monitor and patrol ${location}. The area has accumulated ${count} report(s) — investigate root causes and coordinate with the appropriate offices for resolution.`;
};

/**
 * Main insights generator
 * @param {Array} incidents - Array of incident objects (raw or normalized)
 * @param {Array} complaints - Array of complaint objects (raw or normalized)
 * @param {Object} [options] - Optional config
 * @param {string} [options.context] - "dashboard" (default) or "management"
 * @returns {Array} Array of insight objects sorted by severity
 */
export const generateInsights = (incidents = [], complaints = [], options = {}) => {
  const { context = "dashboard" } = options;
  const insights = [];
  let idCounter = 1;

  const allReports = [
    ...incidents.map((r) => ({ ...r, _source: "incident" })),
    ...complaints.map((r) => ({ ...r, _source: "complaint" })),
  ];

  if (allReports.length === 0) return [];

  // ── Rule 1: Location Hotspot Detection ────────────────────────────
  const locationCounts = {};
  allReports.forEach((r) => {
    const loc = getLocation(r);
    if (!loc) return;
    const simplified = simplifyAddress(loc);
    if (!simplified) return;
    if (!locationCounts[simplified]) {
      locationCounts[simplified] = {
        count: 0, incidents: 0, complaints: 0, original: loc,
        types: {},       // type → count
        statuses: {},    // status → count
        sources: [],     // keep track of source types
      };
    }
    const bucket = locationCounts[simplified];
    bucket.count++;
    if (r._source === "incident") bucket.incidents++;
    else bucket.complaints++;
    // Track per-type counts at this location
    const rType = getType(r);
    bucket.types[rType] = (bucket.types[rType] || 0) + 1;
    // Track per-status counts at this location
    const rStatus = normalizeStatus(r.status);
    bucket.statuses[rStatus] = (bucket.statuses[rStatus] || 0) + 1;
  });

  const hotspots = Object.entries(locationCounts)
    .filter(([, data]) => data.count >= 3)
    .sort((a, b) => b[1].count - a[1].count);

  hotspots.forEach(([location, data]) => {
    const severity = data.count >= 8 ? SEVERITY.CRITICAL : data.count >= 5 ? SEVERITY.WARNING : SEVERITY.INFO;
    insights.push({
      id: idCounter++,
      category: "Location Hotspot",
      severity,
      title: `High activity at ${location.charAt(0).toUpperCase() + location.slice(1)}`,
      description: `${data.count} total reports (${data.incidents} incidents, ${data.complaints} complaints) have been filed at or near this location.`,
      recommendation: `Deploy increased patrol and monitoring at ${location}. Consider scheduling a barangay clean-up drive or infrastructure inspection in the area.`,
      data: { location, ...data },
    });
  });

  // ── Rule 1b: Address-Specific Suggestions (management context only) ──
  if (context === "management") {
    // Generate per-address insights for every location with 2+ reports
    const addressEntries = Object.entries(locationCounts)
      .filter(([, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count);

    addressEntries.forEach(([location, data]) => {
      const locTitle = location.charAt(0).toUpperCase() + location.slice(1);
      // Find the dominant type at this location
      const typeEntries = Object.entries(data.types).sort((a, b) => b[1] - a[1]);
      const [dominantType, dominantCount] = typeEntries[0] || ["Other", data.count];

      // Count unresolved at this location
      const unresolvedCount = (data.statuses.pending || 0) + (data.statuses.dispatched || 0) + (data.statuses.active || 0);

      const severity = data.count >= 6 ? SEVERITY.CRITICAL : data.count >= 4 ? SEVERITY.WARNING : SEVERITY.INFO;

      // Build a breakdown string of all types at this location
      const typeBreakdown = typeEntries
        .map(([name, cnt]) => `${name} (${cnt})`)
        .join(", ");

      const recommendation = getAddressRecommendation(locTitle, dominantType, data.count);

      insights.push({
        id: idCounter++,
        category: "Address Advisory",
        severity,
        title: `${locTitle} — ${dominantType} (${dominantCount} of ${data.count} reports)`,
        description: `${data.count} report(s) filed at ${locTitle}: ${typeBreakdown}. ${unresolvedCount > 0 ? `${unresolvedCount} case(s) remain unresolved.` : "All cases resolved."}`,
        recommendation,
        data: { location, dominantType, dominantCount, unresolvedCount, types: data.types },
      });
    });
  }

  // ── Rule 2: Monthly Spike Detection ───────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentMonthCount = 0;
  let prevMonthCount = 0;

  allReports.forEach((r) => {
    const dateStr = getDate(r);
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) currentMonthCount++;
    if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) prevMonthCount++;
  });

  if (prevMonthCount > 0 && currentMonthCount > prevMonthCount * 1.5) {
    const increase = Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100);
    insights.push({
      id: idCounter++,
      category: "Monthly Spike",
      severity: increase >= 100 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      title: `${increase}% increase in reports this month`,
      description: `This month has ${currentMonthCount} reports compared to ${prevMonthCount} last month, a ${increase}% increase.`,
      recommendation: `Investigate the root cause of the ${increase}% surge. Consider issuing a community advisory or launching an awareness campaign to address the underlying issues.`,
      data: { currentMonthCount, prevMonthCount, increase },
    });
  }

  // ── Rule 3: Pending Backlog ───────────────────────────────────────
  const statusCounts = { pending: 0, dispatched: 0, active: 0, resolved: 0, rejected: 0 };
  allReports.forEach((r) => {
    const s = normalizeStatus(r.status);
    if (statusCounts[s] !== undefined) statusCounts[s]++;
  });

  const pendingRatio = statusCounts.pending / allReports.length;
  if (pendingRatio > 0.4 && allReports.length >= 5) {
    insights.push({
      id: idCounter++,
      category: "Pending Backlog",
      severity: pendingRatio > 0.6 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      title: `${Math.round(pendingRatio * 100)}% of reports are still pending`,
      description: `${statusCounts.pending} out of ${allReports.length} total reports remain in pending status, indicating a processing backlog.`,
      recommendation: `Prioritize clearing the pending backlog. Consider assigning additional staff or scheduling a dedicated case review session to process outstanding reports.`,
      data: { pending: statusCounts.pending, total: allReports.length, ratio: pendingRatio },
    });
  }

  // ── Rule 4: Low Resolution Rate ───────────────────────────────────
  const resolutionRate = statusCounts.resolved / allReports.length;
  if (resolutionRate < 0.3 && allReports.length >= 5) {
    insights.push({
      id: idCounter++,
      category: "Low Resolution Rate",
      severity: resolutionRate < 0.15 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      title: `Only ${Math.round(resolutionRate * 100)}% of reports are resolved`,
      description: `${statusCounts.resolved} out of ${allReports.length} reports have been resolved. The current resolution rate is below the recommended 30% threshold.`,
      recommendation: `Review dispatch and resolution workflows for bottlenecks. Increase follow-up frequency on active and dispatched cases to improve the resolution rate.`,
      data: { resolved: statusCounts.resolved, total: allReports.length, rate: resolutionRate },
    });
  }

  // ── Rule 5: Dominant Category ─────────────────────────────────────
  const typeCounts = {};
  allReports.forEach((r) => {
    const type = getType(r);
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  if (sortedTypes.length > 0) {
    const [topType, topCount] = sortedTypes[0];
    const typeRatio = topCount / allReports.length;
    if (typeRatio > 0.5) {
      insights.push({
        id: idCounter++,
        category: "Dominant Category",
        severity: SEVERITY.WARNING,
        title: `"${topType}" accounts for ${Math.round(typeRatio * 100)}% of all reports`,
        description: `${topCount} out of ${allReports.length} reports are categorized as "${topType}", making it the overwhelmingly dominant issue in the barangay.`,
        recommendation: `Focus resources and attention on "${topType}" issues. Consider launching targeted prevention programs, community information drives, or infrastructure improvements specific to this category.`,
        data: { type: topType, count: topCount, ratio: typeRatio },
      });
    }
  }

  // ── Rule 6: Recent Surge (7-day, same location) ───────────────────
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDayStr = sevenDaysAgo.toISOString().split("T")[0];

  const recentLocationCounts = {};
  allReports.forEach((r) => {
    const dateStr = getDate(r);
    if (!dateStr || dateStr < sevenDayStr) return;
    const loc = simplifyAddress(getLocation(r));
    if (!loc) return;
    recentLocationCounts[loc] = (recentLocationCounts[loc] || 0) + 1;
  });

  Object.entries(recentLocationCounts)
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1])
    .forEach(([location, count]) => {
      insights.push({
        id: idCounter++,
        category: "Recent Surge",
        severity: SEVERITY.CRITICAL,
        title: `${count} reports at ${location.charAt(0).toUpperCase() + location.slice(1)} in the last 7 days`,
        description: `There has been a sudden concentration of ${count} reports at or near ${location} within just the past week, indicating an emerging issue.`,
        recommendation: `Immediate attention needed at ${location}. Deploy a rapid response team to assess the situation and coordinate with local officials for on-ground resolution.`,
        data: { location, count },
      });
    });

  // ── Rule 7: Stale Cases (Pending > 14 days) ──────────────────────
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  let staleCaseCount = 0;
  allReports.forEach((r) => {
    const s = normalizeStatus(r.status);
    if (s !== "pending") return;
    const dateStr = getDate(r);
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d <= fourteenDaysAgo) staleCaseCount++;
  });

  if (staleCaseCount > 0) {
    insights.push({
      id: idCounter++,
      category: "Stale Cases",
      severity: staleCaseCount >= 5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      title: `${staleCaseCount} report(s) pending for over 2 weeks`,
      description: `${staleCaseCount} report(s) have remained in pending status for more than 14 days without resolution or status update.`,
      recommendation: `Escalate these long-pending cases for immediate review. Assign responsible officers and set target resolution dates to prevent further delays.`,
      data: { count: staleCaseCount },
    });
  }

  // ── Rule 8: Complaint vs Incident Imbalance ──────────────────────
  const totalInc = incidents.length;
  const totalComp = complaints.length;
  const total = totalInc + totalComp;

  if (total >= 5) {
    const compRatio = totalComp / total;
    if (compRatio > 0.7) {
      insights.push({
        id: idCounter++,
        category: "Report Imbalance",
        severity: SEVERITY.INFO,
        title: `Complaints dominate at ${Math.round(compRatio * 100)}% of all reports`,
        description: `${totalComp} complaints vs ${totalInc} incidents. The high proportion of complaints suggests interpersonal or community-level disputes are prevalent.`,
        recommendation: `Consider strengthening community mediation programs and conflict resolution services. Conduct barangay assemblies to address common grievances.`,
        data: { incidents: totalInc, complaints: totalComp, ratio: compRatio },
      });
    } else if (compRatio < 0.3) {
      insights.push({
        id: idCounter++,
        category: "Report Imbalance",
        severity: SEVERITY.INFO,
        title: `Incidents dominate at ${Math.round((1 - compRatio) * 100)}% of all reports`,
        description: `${totalInc} incidents vs ${totalComp} complaints. The high proportion of incidents suggests environmental, infrastructure, or safety-related issues are the primary concern.`,
        recommendation: `Focus on infrastructure improvements and environmental hazard mitigation. Coordinate with city engineering and public safety offices for systemic solutions.`,
        data: { incidents: totalInc, complaints: totalComp, ratio: compRatio },
      });
    }
  }

  // ── Summary insight (always shown) ────────────────────────────────
  const topCategories = sortedTypes.slice(0, 3).map(([name, count]) => `${name} (${count})`);
  insights.push({
    id: idCounter++,
    category: "Overview",
    severity: SEVERITY.INFO,
    title: "Data Summary",
    description: `Total: ${allReports.length} reports (${totalInc} incidents, ${totalComp} complaints). Status breakdown — Pending: ${statusCounts.pending}, Dispatched: ${statusCounts.dispatched}, Active: ${statusCounts.active}, Resolved: ${statusCounts.resolved}, Rejected: ${statusCounts.rejected}. Top categories: ${topCategories.join(", ") || "N/A"}.`,
    recommendation: `Continue monitoring dashboard trends regularly. Use these insights to prioritize resource allocation and improve response times across all categories.`,
    data: { totalInc, totalComp, statusCounts, topCategories },
  });

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return insights;
};
