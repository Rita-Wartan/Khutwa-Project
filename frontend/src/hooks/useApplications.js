import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'khutwa-applications';
const STATUS_VALUES = new Set(['pending', 'accepted', 'rejected']);
const normalizeJobId = id => String(id ?? '');

export const applicationStatusConfig = {
  pending: {
    label: 'قيد المراجعة',
    className: 'status-pending',
  },
  accepted: {
    label: 'مقبول',
    className: 'status-accepted',
  },
  rejected: {
    label: 'مرفوض',
    className: 'status-rejected',
  },
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `application-${crypto.randomUUID()}`;
  }

  return `application-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const normalizeApplication = application => {
  if (!application || typeof application !== 'object') {
    return null;
  }

  const jobId = normalizeJobId(application.jobId);
  if (!jobId) {
    return null;
  }

  const status = STATUS_VALUES.has(application.status) ? application.status : 'pending';

  return {
    id: application.id || createId(),
    jobId,
    title: application.title || '',
    company: {
      name: application.company?.name || '',
      logo: application.company?.logo?.url || application.company?.logo || '',
    },
    category: application.category?.name || application.category || '',
    location: application.location || application.city || '',
    jobType: application.jobType || application.type || '',
    jobLevel: application.jobLevel || '',
    appliedAt: application.appliedAt || new Date().toISOString(),
    status,
  };
};

const readApplications = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored)
      ? stored.map(normalizeApplication).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const writeApplications = nextApplications => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextApplications));
};

export default function useApplications() {
  const [applications, setApplications] = useState(readApplications);

  useEffect(() => {
    const sync = () => setApplications(readApplications());
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }
  }, [applications]);

  const applyToJob = useCallback(job => {
    const jobId = normalizeJobId(job?._id || job?.id);

    if (!jobId) {
      return { created: false, reason: 'invalid' };
    }

    let result = { created: false, reason: 'duplicate' };

    setApplications(current => {
      if (current.some(application => application.jobId === jobId)) {
        result = { created: false, reason: 'duplicate' };
        return current;
      }

      const nextApplications = [
        {
          id: createId(),
          jobId,
          title: job.title,
          company: {
            name: job.company?.name || '',
            logo: job.company?.logo?.url || job.company?.logo || '',
          },
          category: job.category?.name || job.category || '',
          location: job.city || job.location || '',
          jobType: job.jobType || job.type || '',
          jobLevel: job.jobLevel || '',
          appliedAt: new Date().toISOString(),
          status: 'pending',
        },
        ...current,
      ];

      result = { created: true, reason: 'created' };
      writeApplications(nextApplications);
      return nextApplications;
    });

    return result;
  }, []);

  const withdrawApplication = useCallback(jobId => {
    const normalizedJobId = normalizeJobId(jobId);
    let removed = false;

    setApplications(current => {
      const nextApplications = current.filter(application => {
        const keep = application.jobId !== normalizedJobId;
        if (!keep) {
          removed = true;
        }
        return keep;
      });

      if (removed) {
        writeApplications(nextApplications);
      }

      return nextApplications;
    });

    return removed;
  }, []);

  const hasApplied = useCallback(jobId => applications.some(application => application.jobId === normalizeJobId(jobId)), [applications]);

  const getApplicationByJobId = useCallback(jobId => applications.find(application => application.jobId === normalizeJobId(jobId)), [applications]);

  return {
    applications,
    applyToJob,
    hasApplied,
    getApplicationByJobId,
    withdrawApplication,
  };
}

export const formatApplicationDate = value =>
  new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
