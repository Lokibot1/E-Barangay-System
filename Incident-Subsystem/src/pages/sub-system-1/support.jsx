import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getUser } from '../../homepage/services/loginService';
import {
  createSystemIssue,
  fetchSystemIssues,
  updateSystemIssue,
} from '../../services/shared/systemIssueService';
import {
  Bug,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CloudOff,
  HelpCircle,
  ImagePlus,
  Loader2,
  Mail,
  MousePointer2,
  Paperclip,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import themeTokens from '../../Themetokens';
import {
  clearSupportDraft,
  loadQueuedSupportIssues,
  loadSupportDraft,
  queueSupportIssue,
  removeQueuedSupportIssue,
  saveSupportDraft,
  syncQueuedSupportIssues,
} from '../../services/shared/supportDraftQueueService';

const ISSUE_CATEGORIES = [
  'Login / Access',
  'Document Requests',
  'Incident / Complaint Module',
  'Profile / Account',
  'Slow Loading / Performance',
  'UI / Layout Bug',
  'Data Error',
  'Other',
];

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const STATUS_STYLES = {
  open: 'border-rose-200 bg-rose-50 text-rose-700',
  in_review: 'border-amber-200 bg-amber-50 text-amber-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  queued: 'border-sky-200 bg-sky-50 text-sky-700',
};

const ADMIN_SUPPORT_TABS = [
  { key: 'workflow', label: 'Support Workflow', icon: HelpCircle },
  { key: 'queue', label: 'Support Queue', icon: Bug },
];

const RESIDENT_SUPPORT_TABS = [
  { key: 'workflow', label: 'Support Workflow', icon: HelpCircle },
  { key: 'queue', label: 'My Issue Reports', icon: Bug },
];

const formatUserName = (user) => {
  if (!user) return '';
  if (user.name) return user.name;

  const parts = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);

  return parts.join(' ');
};

const formatIssueDate = (value) => {
  if (!value) return 'Unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatFileSize = (size = 0) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });

const hasDraftContent = (form) =>
  Boolean(
    form?.subject?.trim() ||
      form?.description?.trim() ||
      form?.steps?.trim() ||
      form?.affectedPage?.trim() ||
      form?.attachment
  );

const sortIssueRecords = (items = []) =>
  [...items].sort(
    (a, b) =>
      new Date(b?.created_at || b?.queued_at || 0).getTime() -
      new Date(a?.created_at || a?.queued_at || 0).getTime()
  );

const normalizeQueuedIssue = (item) => ({
  id: item?.id || `queued-${Date.now()}`,
  status: 'queued',
  category: item?.payload?.category || 'Other',
  severity: item?.payload?.severity || 'medium',
  subject: item?.payload?.subject || 'Offline issue report',
  description: item?.payload?.description || '',
  affected_page: item?.payload?.affected_page || item?.payload?.reported_from_path || '',
  reporter_name: item?.payload?.reporter_name || 'Resident',
  reporter_email: item?.payload?.reporter_email || '',
  attachment: item?.payload?.attachment || null,
  created_at: item?.queued_at || new Date().toISOString(),
  isQueued: true,
});

const isQueueableSupportError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('offline') ||
    message.includes('unavailable') ||
    message.includes('network')
  );
};

export default function Support() {
  const { tr } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'modern'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];
  const isAdminView = location.pathname.startsWith('/admin');
  const isReportIssuePage = !isAdminView && location.pathname === '/report-issue';
  const authUser = getUser();
  const reporterName = formatUserName(authUser) || 'Resident';
  const reporterEmail = authUser?.email || '';
  const reporterKey =
    authUser?.id ??
    authUser?.resident_id ??
    authUser?.barangay_id ??
    reporterEmail;
  const supportScope = String(reporterKey || reporterEmail || 'guest');
  const draftHydratedRef = React.useRef(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [issues, setIssues] = useState([]);
  const [queuedIssues, setQueuedIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [issueError, setIssueError] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [syncingQueued, setSyncingQueued] = useState(false);
  const [queueFeedback, setQueueFeedback] = useState({ type: '', message: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminUpdatingId, setAdminUpdatingId] = useState(null);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const [submitFeedback, setSubmitFeedback] = useState({ type: '', message: '' });
  const [issueForm, setIssueForm] = useState({
    category: ISSUE_CATEGORIES[0],
    severity: 'medium',
    subject: '',
    description: '',
    steps: '',
    affectedPage: '',
    contactEmail: reporterEmail,
    attachment: null,
  });

  const faqs = [
    {
      q: 'How do I report a bug or technical issue?',
      a: 'Open the Report System Issue form on this page, choose the affected module, describe what happened, and include the page or feature involved.',
    },
    {
      q: 'What details should I include in my issue report?',
      a: 'Include the affected page, the exact error or incorrect behavior, what you were trying to do, and the steps needed to reproduce the problem.',
    },
    {
      q: 'Can I submit a report even if the page only loads partially?',
      a: 'Yes. Mention that the page loaded partially or slowly, then list the buttons, tabs, or forms that failed so the support team can narrow down the issue faster.',
    },
    {
      q: 'Will my issue report include device information?',
      a: 'The system automatically captures the current route and browser details during submission to help diagnose compatibility and page-specific problems.',
    },
  ];

  useEffect(() => {
    setIssueForm((prev) => ({
      ...prev,
      contactEmail: prev.contactEmail || reporterEmail,
    }));
  }, [reporterEmail]);

  useEffect(() => {
    if (isAdminView) return;

    const savedDraft = loadSupportDraft(supportScope);
    const queued = loadQueuedSupportIssues(supportScope);

    setQueuedIssues(queued);

    if (savedDraft && hasDraftContent(savedDraft)) {
      setIssueForm((prev) => ({
        ...prev,
        ...savedDraft,
        contactEmail:
          savedDraft.contactEmail || savedDraft.reporter_email || prev.contactEmail || reporterEmail,
      }));
      setSubmitFeedback({
        type: 'success',
        message: 'Your offline support draft was restored on this device.',
      });
    }

    draftHydratedRef.current = true;
  }, [isAdminView, reporterEmail, supportScope]);

  useEffect(() => {
    if (isAdminView || !draftHydratedRef.current) return;

    if (hasDraftContent(issueForm)) {
      saveSupportDraft(supportScope, {
        ...issueForm,
        saved_at: new Date().toISOString(),
      });
      return;
    }

    clearSupportDraft(supportScope);
  }, [isAdminView, issueForm, supportScope]);

  const resetIssueComposer = React.useCallback(() => {
    setIssueForm((prev) => ({
      ...prev,
      subject: '',
      description: '',
      steps: '',
      affectedPage: '',
      attachment: null,
      contactEmail: prev.contactEmail || reporterEmail,
    }));
    clearSupportDraft(supportScope);
    setAttachmentInputKey((prev) => prev + 1);
  }, [reporterEmail, supportScope]);

  const syncQueuedReports = React.useCallback(
    async ({ silent = false } = {}) => {
      if (isAdminView || syncingQueued) return;

      const pendingQueue = loadQueuedSupportIssues(supportScope);
      if (pendingQueue.length === 0) {
        setQueuedIssues([]);
        if (!silent) {
          setSubmitFeedback({
            type: 'success',
            message: 'No queued offline reports are waiting to sync.',
          });
        }
        return;
      }

      setSyncingQueued(true);

      try {
        const { synced, remaining } = await syncQueuedSupportIssues(
          supportScope,
          createSystemIssue
        );

        setQueuedIssues(remaining);

        if (synced.length > 0) {
          setIssues((prev) => sortIssueRecords([...synced, ...prev]));
          setSubmitFeedback({
            type: 'success',
            message:
              remaining.length > 0
                ? `${synced.length} queued report(s) synced. ${remaining.length} still need a stable connection.`
                : `${synced.length} queued report(s) synced successfully.`,
          });
        } else if (!silent) {
          setSubmitFeedback({
            type: 'error',
            message: 'Queued reports are still waiting for a stable connection.',
          });
        }
      } catch (error) {
        if (!silent) {
          setSubmitFeedback({
            type: 'error',
            message: error.message || 'Failed to sync queued issue reports.',
          });
        }
      } finally {
        setSyncingQueued(false);
      }
    },
    [isAdminView, supportScope, syncingQueued]
  );

  useEffect(() => {
    if (isAdminView) return undefined;

    const handleOnline = () => {
      syncQueuedReports({ silent: true });
    };

    window.addEventListener('online', handleOnline);

    if (queuedIssues.length > 0 && navigator.onLine) {
      handleOnline();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, [isAdminView, queuedIssues.length, syncQueuedReports]);

  const supportTabs = useMemo(
    () => (isAdminView ? ADMIN_SUPPORT_TABS : RESIDENT_SUPPORT_TABS),
    [isAdminView]
  );
  const adminSupportTab = useMemo(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    return supportTabs.some((item) => item.key === tab) ? tab : 'workflow';
  }, [location.search, supportTabs]);

  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      if (!isAdminView && !supportScope) {
        setIssues([]);
        setLoadingIssues(false);
        return;
      }

      setLoadingIssues(true);
      setIssueError('');

      try {
        const response = await fetchSystemIssues(
          isAdminView
            ? {
                limit: 100,
              }
            : {
                user_id: reporterKey,
                reporter_email: reporterEmail || undefined,
                limit: 10,
              }
        );

        if (active) {
          setIssues(sortIssueRecords(Array.isArray(response?.data) ? response.data : []));
        }
      } catch (error) {
        if (active) {
          setIssueError(
            error.message ||
              (isAdminView
                ? 'Unable to load the support queue.'
                : 'Unable to load your submitted reports.')
          );
        }
      } finally {
        if (active) {
          setLoadingIssues(false);
        }
      }
    };

    loadIssues();

    return () => {
      active = false;
    };
  }, [isAdminView, reporterEmail, reporterKey, supportScope]);

  const allIssues = useMemo(() => {
    if (isAdminView) {
      return issues;
    }

    return sortIssueRecords([
      ...queuedIssues.map(normalizeQueuedIssue),
      ...issues,
    ]);
  }, [isAdminView, issues, queuedIssues]);

  const issueSummary = useMemo(() => {
    const openCount = allIssues.filter((item) => item.status === 'open').length;
    const inReviewCount = allIssues.filter((item) => item.status === 'in_review').length;
    const resolvedCount = allIssues.filter((item) => item.status === 'resolved').length;
    const queuedCount = allIssues.filter((item) => item.status === 'queued').length;

    return {
      total: allIssues.length,
      open: openCount,
      inReview: inReviewCount,
      resolved: resolvedCount,
      queued: queuedCount,
    };
  }, [allIssues]);

  const visibleIssues = useMemo(() => {
    if (!isAdminView || statusFilter === 'all') {
      return allIssues;
    }

    return allIssues.filter((item) => (item.status || 'open') === statusFilter);
  }, [allIssues, isAdminView, statusFilter]);

  const showSupportWorkflowExtras = adminSupportTab === 'workflow';
  const showAdminQueueSidebar = isAdminView && adminSupportTab === 'queue';
  const showResidentQueuePanel = !isAdminView && adminSupportTab === 'queue';

  const filteredFaqs = faqs.filter((faq) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    return `${faq.q} ${faq.a}`.toLowerCase().includes(keyword);
  });

  const handleAdminTabChange = (key) => {
    if (key === adminSupportTab) return;
    navigate(`${location.pathname}?tab=${key}`);
  };

  const updateIssueForm = (field, value) => {
    setIssueForm((prev) => ({ ...prev, [field]: value }));
    if (submitFeedback.type) {
      setSubmitFeedback({ type: '', message: '' });
    }
  };

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      setSubmitFeedback({
        type: 'error',
        message: 'Please attach a JPG, PNG, or WEBP image only.',
      });
      setAttachmentInputKey((prev) => prev + 1);
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setSubmitFeedback({
        type: 'error',
        message: 'Attached image must be 2 MB or smaller.',
      });
      setAttachmentInputKey((prev) => prev + 1);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);

      updateIssueForm('attachment', {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      });
    } catch (error) {
      setSubmitFeedback({
        type: 'error',
        message: error.message || 'Unable to attach the selected image.',
      });
      setAttachmentInputKey((prev) => prev + 1);
    }
  };

  const clearAttachment = () => {
    updateIssueForm('attachment', null);
    setAttachmentInputKey((prev) => prev + 1);
  };

  const handleClearDraft = () => {
    resetIssueComposer();
    setSubmitFeedback({
      type: 'success',
      message: 'Your offline support draft has been cleared.',
    });
  };

  const handleRemoveQueuedIssue = (queueId) => {
    const nextQueue = removeQueuedSupportIssue(supportScope, queueId);
    setQueuedIssues(nextQueue);
    setSubmitFeedback({
      type: 'success',
      message: 'Queued offline report removed.',
    });
  };

  const handleIssueStatusUpdate = async (issueId, nextStatus) => {
    if (!isAdminView || !issueId) return;

    setAdminUpdatingId(issueId);
    setQueueFeedback({ type: '', message: '' });

    try {
      const updatedIssue = await updateSystemIssue(issueId, { status: nextStatus });

      setIssues((prev) =>
        sortIssueRecords(
          prev.map((item) => (item.id === issueId ? { ...item, ...updatedIssue } : item))
        )
      );
      setQueueFeedback({
        type: 'success',
        message: `Issue #${issueId} status updated to ${nextStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      setQueueFeedback({
        type: 'error',
        message: error.message || 'Failed to update issue status.',
      });
    } finally {
      setAdminUpdatingId(null);
    }
  };

  const handleIssueSubmit = async (event) => {
    event.preventDefault();
    if (issueSubmitting) return;

    setIssueSubmitting(true);
    setSubmitFeedback({ type: '', message: '' });

    const payload = {
      user_id: reporterKey || null,
      reporter_name: reporterName,
      reporter_email: issueForm.contactEmail.trim() || reporterEmail || '',
      user_role: authUser?.role || 'resident',
      category: issueForm.category,
      severity: issueForm.severity,
      subject: issueForm.subject.trim(),
      description: issueForm.description.trim(),
      steps_to_reproduce: issueForm.steps.trim(),
      affected_page: issueForm.affectedPage.trim(),
      reported_from_path: location.pathname,
      browser_info:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'Unavailable',
      attachment: issueForm.attachment
        ? {
            name: issueForm.attachment.name,
            type: issueForm.attachment.type,
            size: issueForm.attachment.size,
            data_url: issueForm.attachment.dataUrl,
          }
        : null,
    };

    try {
      const created = await createSystemIssue(payload);

      setIssues((prev) => sortIssueRecords([created, ...prev]));
      resetIssueComposer();
      setSubmitFeedback({
        type: 'success',
        message: 'Your issue report has been submitted. Support can now review it.',
      });
    } catch (error) {
      if (!isAdminView && isQueueableSupportError(error)) {
        const queued = queueSupportIssue(supportScope, payload);
        setQueuedIssues((prev) => [queued, ...prev]);
        resetIssueComposer();
        setSubmitFeedback({
          type: 'success',
          message:
            'You appear to be offline. Your report was added to the offline queue and will sync automatically later.',
        });
      } else {
      setSubmitFeedback({
        type: 'error',
        message: error.message || 'Failed to submit your issue report.',
      });
      }
    } finally {
      setIssueSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 pb-10">
      <div>
        <h1 className={`text-2xl font-spartan font-bold ${t.cardText} uppercase tracking-tight`}>
          {isReportIssuePage
            ? tr.sidebar.reportSystemIssue || 'Report Issue'
            : tr.sub1.support}
        </h1>
        <p className={`text-[10px] font-kumbh ${t.subtleText} uppercase tracking-[3px] mt-1`}>
          {isAdminView
            ? 'Admin Support Queue and Issue Review Center'
            : isReportIssuePage
              ? 'Direct System Issue Reporting Form'
              : 'User Help Desk and Support Center'}
        </p>
      </div>

      <div className={`flex items-center gap-5 border-b ${t.cardBorder} pt-1`}>
        {(isAdminView ? ADMIN_SUPPORT_TABS : RESIDENT_SUPPORT_TABS).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleAdminTabChange(key)}
            className={`relative pb-2 text-[13px] font-semibold font-kumbh transition inline-flex items-center gap-2 ${
              adminSupportTab === key ? t.primaryText : `${t.subtleText} hover:opacity-80`
            }`}
          >
            <Icon size={14} />
            {label}
            {adminSupportTab === key && (
              <span className={`absolute left-0 right-0 -bottom-px h-0.5 ${t.primarySolid}`} />
            )}
          </button>
        ))}
      </div>

      <div
        className={`grid grid-cols-1 gap-8 ${
          showAdminQueueSidebar ? 'lg:grid-cols-3' : ''
        }`}
      >
        <div
          className={`${
            showAdminQueueSidebar ? 'lg:col-span-2' : ''
          } space-y-6`}
        >
          {((!isAdminView && adminSupportTab === 'workflow') || (isAdminView && adminSupportTab === 'queue')) && (
            <div className={`${t.cardBg} border ${t.cardBorder} p-8 shadow-sm rounded-2xl`}>
            <div className="flex items-start gap-4 mb-8">
              <div className={`${t.primaryLight} p-3 rounded-2xl ${t.primaryText}`}>
                <Bug size={22} />
              </div>
              <div>
                <h2 className={`text-sm font-spartan font-bold ${t.cardText} uppercase tracking-widest`}>
                  {isAdminView ? 'Support Workflow' : 'Report System Issue'}
                </h2>
                <p className={`mt-2 text-[11px] font-kumbh ${t.subtleText} leading-relaxed`}>
                  {isAdminView
                    ? 'Residents can submit bug reports from the user portal. Use the support queue on the right to monitor incoming reports and update their status.'
                    : 'Submit a technical complaint if a page is broken, data looks wrong, a request fails, or the portal behaves unexpectedly.'}
                </p>
              </div>
            </div>

            {!isAdminView ? (
              <form onSubmit={handleIssueSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className={`rounded-2xl border px-4 py-4 ${t.inlineBg} ${t.cardBorder}`}>
                    <div className="flex items-start gap-3">
                      <Save size={18} className={t.primaryText} />
                      <div>
                        <p className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                          Offline Draft
                        </p>
                        <p className={`mt-2 text-[11px] font-kumbh leading-relaxed ${t.subtleText}`}>
                          Your report autosaves locally while you type, so you can continue even if the page refreshes.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleClearDraft}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest ${t.cardText} ${t.cardBg} ${t.cardBorder}`}
                      >
                        <Trash2 size={14} />
                        Clear Draft
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <CloudOff size={18} className="text-sky-600" />
                      <div>
                        <p className="text-[10px] font-spartan font-bold uppercase tracking-widest text-sky-700">
                          Offline Queue
                        </p>
                        <p className="mt-2 text-[11px] font-kumbh leading-relaxed text-sky-700">
                          {issueSummary.queued > 0
                            ? `${issueSummary.queued} report(s) are waiting to sync when your connection stabilizes.`
                            : 'If the server is offline, your report is queued here automatically.'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => syncQueuedReports()}
                        disabled={syncingQueued || issueSummary.queued === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw size={14} className={syncingQueued ? 'animate-spin' : ''} />
                        {syncingQueued ? 'Syncing' : 'Sync Queue'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <label className="space-y-2 block">
                    <span className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                      Category
                    </span>
                    <select
                      value={issueForm.category}
                      onChange={(event) => updateIssueForm('category', event.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-kumbh ${t.cardText} ${t.cardBg} ${t.cardBorder} outline-none`}
                    >
                      {ISSUE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 block">
                    <span className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                      Subject
                    </span>
                    <input
                      type="text"
                      required
                      value={issueForm.subject}
                      onChange={(event) => updateIssueForm('subject', event.target.value)}
                      placeholder="Short title for the problem"
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-kumbh ${t.cardText} ${t.cardBg} ${t.cardBorder} outline-none`}
                    />
                  </label>
                </div>

                <label className="space-y-2 block">
                  <span className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                    What happened?
                  </span>
                  <textarea
                    required
                    rows={5}
                    value={issueForm.description}
                    onChange={(event) => updateIssueForm('description', event.target.value)}
                    placeholder="Tell us what you clicked, what you expected, and what actually happened."
                    className={`w-full rounded-2xl border px-4 py-3 text-sm font-kumbh ${t.cardText} ${t.cardBg} ${t.cardBorder} outline-none`}
                  />
                </label>

                <div
                  className={`mx-auto max-w-3xl rounded-2xl border border-dashed px-4 py-5 ${t.inlineBg} ${t.cardBorder}`}
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`${t.primaryLight} rounded-xl p-2.5 ${t.primaryText}`}>
                      <Paperclip size={18} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                        Attach Screenshot
                      </p>
                      <p className={`mt-2 text-[11px] font-kumbh leading-relaxed ${t.subtleText}`}>
                        Optional, but helpful. Attach one image so the support team can quickly see the issue.
                      </p>
                    </div>

                    {issueForm.attachment && (
                      <button
                        type="button"
                        onClick={clearAttachment}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-700"
                        aria-label="Remove attached image"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {!issueForm.attachment ? (
                    <div className="mt-5 text-center">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-spartan font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50">
                        <input
                          key={`attachment-${attachmentInputKey}`}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAttachmentChange}
                        />
                        <ImagePlus size={16} />
                        Choose Image
                      </label>
                      <p className={`mt-3 text-[11px] font-kumbh ${t.subtleText}`}>
                        PNG, JPG, or WEBP up to 2 MB.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-center sm:items-center">
                      <img
                        src={issueForm.attachment.dataUrl}
                        alt="Issue attachment preview"
                        className="h-32 w-full rounded-xl object-cover sm:w-64"
                      />
                      <div className="space-y-2">
                        <p className={`text-sm font-spartan font-bold ${t.cardText}`}>
                          {issueForm.attachment.name}
                        </p>
                        <p className={`text-[11px] font-kumbh ${t.subtleText}`}>
                          {issueForm.attachment.type} • {formatFileSize(issueForm.attachment.size)}
                        </p>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50">
                          <input
                            key={`attachment-replace-${attachmentInputKey}`}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleAttachmentChange}
                          />
                          <ImagePlus size={14} />
                          Replace Image
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {submitFeedback.message && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                      submitFeedback.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {submitFeedback.type === 'success' ? (
                      <CheckCircle2 size={18} className="mt-0.5" />
                    ) : (
                      <CircleAlert size={18} className="mt-0.5" />
                    )}
                    <span className="font-kumbh">{submitFeedback.message}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={issueSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-[11px] font-spartan font-bold uppercase tracking-widest text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {issueSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending Report
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Report Issue
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-xl border px-4 py-4 ${t.inlineBg} ${t.cardBorder}`}>
                  <p className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                    Review flow
                  </p>
                  <p className={`mt-2 text-[11px] font-kumbh leading-relaxed ${t.subtleText}`}>
                    New reports enter the queue as <span className={t.cardText}>open</span>. Staff can move them to <span className={t.cardText}>in review</span> while validating the issue, then mark them <span className={t.cardText}>resolved</span> once fixed or confirmed.
                  </p>
                </div>
                <div className={`rounded-xl border px-4 py-4 ${t.inlineBg} ${t.cardBorder}`}>
                  <p className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                    Captured details
                  </p>
                  <p className={`mt-2 text-[11px] font-kumbh leading-relaxed ${t.subtleText}`}>
                    Each report includes the reporter name, contact email, affected page, route path, browser info, and reproduction steps when provided.
                  </p>
                </div>
              </div>
            )}
            </div>
          )}

          {showSupportWorkflowExtras && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
              <div className={`${t.cardBg} border ${t.cardBorder} p-8 shadow-sm rounded-2xl`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`${t.primaryLight} p-2 rounded-xl ${t.primaryText}`}>
                    <HelpCircle size={20} />
                  </div>
                  <h2 className={`text-sm font-spartan font-bold ${t.cardText} uppercase tracking-widest`}>
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 ${t.inlineBg} ${t.cardBorder}`}>
                  <Search size={16} className={t.subtleText} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search support topics..."
                    className={`w-full bg-transparent text-sm font-kumbh outline-none ${t.cardText}`}
                  />
                </div>

                <div className="space-y-4">
                  {filteredFaqs.map((faq, i) => (
                    <details
                      key={i}
                      className={`group border-b ${t.cardBorder} pb-4 cursor-pointer`}
                    >
                      <summary className={`flex justify-between items-center list-none font-kumbh font-bold ${t.cardText} text-xs uppercase tracking-tight transition-colors`}>
                        {faq.q}
                        <ChevronDown
                          size={14}
                          className={`group-open:rotate-180 transition-transform ${t.subtleText}`}
                        />
                      </summary>
                      <p className={`mt-3 text-[11px] font-kumbh ${t.subtleText} leading-relaxed`}>
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <ShieldAlert className="text-red-500" size={18} />
                    <h3 className="text-[10px] font-spartan font-bold text-red-700 uppercase tracking-widest">
                      Emergency Contacts
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className={`${t.cardBg} p-3 rounded-xl border border-red-200 flex justify-between items-center`}>
                      <span className={`text-[10px] font-spartan font-bold ${t.cardText} uppercase`}>
                        Police Station
                      </span>
                      <span className="text-[11px] font-kumbh font-bold text-red-600 tracking-tighter">
                        911
                      </span>
                    </div>
                    <div className={`${t.cardBg} p-3 rounded-xl border border-red-200 flex justify-between items-center`}>
                      <span className={`text-[10px] font-spartan font-bold ${t.cardText} uppercase`}>
                        Bureau of Fire
                      </span>
                      <span className="text-[11px] font-kumbh font-bold text-red-600 tracking-tighter">
                        117
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`${t.cardBg} border ${t.cardBorder} p-6 rounded-2xl shadow-sm`}>
                  <h3 className={`text-[10px] font-spartan font-bold ${t.subtleText} uppercase tracking-widest mb-6`}>
                    Technical Support
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex items-center gap-4 p-4 ${t.inlineBg} rounded-xl border ${t.cardBorder}`}>
                      <Mail className={t.subtleText} size={18} />
                      <div>
                        <p className={`text-[9px] font-spartan font-bold ${t.subtleText} uppercase`}>Email</p>
                        <p className={`text-[11px] font-kumbh font-bold ${t.cardText}`}>
                          support@brgysystem.ph
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 ${t.inlineBg} rounded-xl border ${t.cardBorder}`}>
                      <p className={`text-[9px] font-spartan font-bold ${t.subtleText} uppercase tracking-widest`}>
                        Support note
                      </p>
                      <p className={`mt-2 text-[11px] font-kumbh leading-relaxed ${t.subtleText}`}>
                        {isAdminView
                          ? 'Support tickets on this page can be reviewed and updated by staff without leaving the admin panel.'
                          : 'System issue reports from this page are saved directly into the support queue so the team can review them later.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showSupportWorkflowExtras && (
            <div className="bg-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MousePointer2 size={18} className="text-emerald-200" />
                <p className="text-emerald-100 text-[10px] font-spartan font-bold uppercase tracking-[3px]">
                  System Tips
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                  <p className="text-[9px] font-spartan font-bold text-emerald-200 uppercase mb-1">
                    Be specific
                  </p>
                  <p className="text-xs font-kumbh font-bold italic">
                    Mention the page, feature, or button name where the issue happened.
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                  <p className="text-[9px] font-spartan font-bold text-emerald-200 uppercase mb-1">
                    Better reports
                  </p>
                  <p className="text-xs font-kumbh font-bold italic">
                    Include the action you expected and the actual result you saw.
                  </p>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {(showAdminQueueSidebar || showResidentQueuePanel) && (
          <div className="space-y-6">
            <div className={`${t.cardBg} border ${t.cardBorder} p-6 rounded-2xl shadow-sm`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Bug className={t.primaryText} size={18} />
                <h3 className={`text-[10px] font-spartan font-bold ${t.subtleText} uppercase tracking-widest`}>
                  {isAdminView ? 'Support Queue' : 'My Issue Reports'}
                </h3>
              </div>

              {isAdminView && (
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={`rounded-xl border px-3 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest ${t.cardText} ${t.cardBg} ${t.cardBorder} outline-none`}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={`grid gap-3 mb-5 ${isAdminView ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-4'}`}>
              <div className={`${t.inlineBg} ${t.cardBorder} border rounded-xl px-3 py-3 text-center`}>
                <p className={`text-[9px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>Total</p>
                <p className={`mt-2 text-xl font-spartan font-bold ${t.cardText}`}>{issueSummary.total}</p>
              </div>
              <div className="border border-rose-200 bg-rose-50 rounded-xl px-3 py-3 text-center">
                <p className="text-[9px] font-spartan font-bold uppercase tracking-widest text-rose-600">Open</p>
                <p className="mt-2 text-xl font-spartan font-bold text-rose-700">{issueSummary.open}</p>
              </div>
              {isAdminView && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl px-3 py-3 text-center">
                  <p className="text-[9px] font-spartan font-bold uppercase tracking-widest text-amber-600">In Review</p>
                  <p className="mt-2 text-xl font-spartan font-bold text-amber-700">{issueSummary.inReview}</p>
                </div>
              )}
              {!isAdminView && (
                <div className="border border-sky-200 bg-sky-50 rounded-xl px-3 py-3 text-center">
                  <p className="text-[9px] font-spartan font-bold uppercase tracking-widest text-sky-600">Queued</p>
                  <p className="mt-2 text-xl font-spartan font-bold text-sky-700">{issueSummary.queued}</p>
                </div>
              )}
              <div className="border border-emerald-200 bg-emerald-50 rounded-xl px-3 py-3 text-center">
                <p className="text-[9px] font-spartan font-bold uppercase tracking-widest text-emerald-600">Resolved</p>
                <p className="mt-2 text-xl font-spartan font-bold text-emerald-700">{issueSummary.resolved}</p>
              </div>
            </div>

            {isAdminView && queueFeedback.message && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                  queueFeedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {queueFeedback.type === 'success' ? (
                  <CheckCircle2 size={18} className="mt-0.5" />
                ) : (
                  <CircleAlert size={18} className="mt-0.5" />
                )}
                <span className="font-kumbh">{queueFeedback.message}</span>
              </div>
            )}

            {loadingIssues ? (
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-4 ${t.inlineBg} ${t.cardBorder}`}>
                <Loader2 size={16} className={`animate-spin ${t.subtleText}`} />
                <p className={`text-[11px] font-kumbh ${t.subtleText}`}>
                  {isAdminView
                    ? 'Loading support queue...'
                    : 'Loading your submitted issue reports...'}
                </p>
              </div>
            ) : issueError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4">
                <p className="text-[11px] font-kumbh font-bold text-rose-700">{issueError}</p>
              </div>
            ) : visibleIssues.length === 0 ? (
              <div className={`rounded-xl border px-4 py-4 ${t.inlineBg} ${t.cardBorder}`}>
                <p className={`text-[11px] font-kumbh ${t.subtleText}`}>
                  {isAdminView
                    ? 'No issue reports match the selected status.'
                    : 'No technical issue reports submitted yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleIssues.slice(0, isAdminView ? 8 : 6).map((issue) => (
                  <div key={issue.id} className={`rounded-xl border p-4 ${t.inlineBg} ${t.cardBorder}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-[11px] font-spartan font-bold uppercase tracking-tight ${t.cardText}`}>
                          #{issue.id} {issue.subject}
                        </p>
                        {isAdminView && (
                          <p className={`mt-1 text-[10px] font-kumbh ${t.subtleText}`}>
                            Reporter: {issue.reporter_name || 'Resident'}
                            {issue.reporter_email ? ` (${issue.reporter_email})` : ''}
                          </p>
                        )}
                        <p className={`mt-1 text-[10px] font-kumbh ${t.subtleText}`}>
                          {issue.category}
                          {issue.affected_page ? ' - ' + issue.affected_page : ''}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[9px] font-spartan font-bold uppercase tracking-widest ${STATUS_STYLES[issue.status] || STATUS_STYLES.open}`}>
                        {(issue.status || 'open').replace('_', ' ')}
                      </span>
                    </div>
                    <p className={`mt-3 text-[11px] font-kumbh leading-relaxed ${t.subtleText}`}>
                      {issue.description}
                    </p>
                    {issue.attachment?.data_url && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img
                          src={issue.attachment.data_url}
                          alt={issue.attachment.name || 'Attached screenshot'}
                          className="h-40 w-full object-cover"
                        />
                        <div className="px-3 py-2">
                          <p className={`text-[10px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                            Attached Screenshot
                          </p>
                          <p className={`mt-1 text-[11px] font-kumbh ${t.subtleText}`}>
                            {issue.attachment.name || 'Image attachment'}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className={`mt-2 text-[10px] font-kumbh ${t.subtleText}`}>
                      Submitted: {formatIssueDate(issue.created_at)}
                    </p>
                    {!isAdminView && issue.isQueued && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3">
                        <p className="text-[10px] font-kumbh text-sky-700">
                          This report is stored locally and will sync once the system is reachable again.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => syncQueuedReports()}
                            disabled={syncingQueued}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <RefreshCw size={14} className={syncingQueued ? 'animate-spin' : ''} />
                            Sync
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQueuedIssue(issue.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest text-sky-700"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    {isAdminView && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className={`text-[10px] font-kumbh ${t.subtleText}`}>
                          Severity: <span className={t.cardText}>{issue.severity || 'medium'}</span>
                        </p>
                        <label className="flex items-center gap-2">
                          <span className={`text-[9px] font-spartan font-bold uppercase tracking-widest ${t.subtleText}`}>
                            Set Status
                          </span>
                          <select
                            value={issue.status || 'open'}
                            disabled={adminUpdatingId === issue.id}
                            onChange={(event) =>
                              handleIssueStatusUpdate(issue.id, event.target.value)
                            }
                            className={`rounded-lg border px-2.5 py-2 text-[10px] font-spartan font-bold uppercase tracking-widest ${t.cardText} ${t.cardBg} ${t.cardBorder} outline-none disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
