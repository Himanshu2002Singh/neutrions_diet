import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  UserPlus,
  X,
  Copy,
  Check,
  Timer
} from 'lucide-react';
import { 
  DoctorTask, 
  DoctorTaskStatus, 
  TaskStats, 
  ReferralInfo,
  getDoctorTasks, 
  updateDoctorTaskStatus, 
  getDoctorReferrals,
  getDoctorReferralCode,
  createReferralInvite
} from '../services/api';
import { AdminUser } from '../types';

interface DoctorTasksProps {
  sidebarOpen?: boolean;
}

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  category: 'doctor' | 'dietitian' | null;
}

// Helper function to get status color
const getStatusColor = (status: DoctorTaskStatus): string => {
  const colors: {[key in DoctorTaskStatus]?: string} = {
    assigned: 'bg-blue-100 text-blue-800',
    accepted: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get status label
const getStatusLabel = (status: DoctorTaskStatus): string => {
  const labels: {[key in DoctorTaskStatus]?: string} = {
    assigned: 'Assigned',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected'
  };
  return labels[status] || status;
};

// Helper function to get priority color
const getPriorityColor = (priority: string): string => {
  const colors: {[key: string]: string} = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    urgent: 'text-red-600 bg-red-50'
  };
  return colors[priority] || 'text-gray-600 bg-gray-50';
};

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to check if task is overdue
const isOverdue = (dueDate: string | null, status: DoctorTaskStatus): boolean => {
  if (!dueDate || status === 'completed' || status === 'rejected') return false;
  return new Date(dueDate) < new Date();
};

// Helper function to check if task is referral task
const isReferralTask = (task: DoctorTask): boolean => {
  return task.task?.title?.toLowerCase().includes('referral') || 
         task.task?.title?.toLowerCase().includes('new user') ||
         task.task?.taskType === 'new_user' ||
         task.referralCount > 0;
};

// Helper function to get task type label
const getTaskTypeLabel = (taskType: string): string => {
  const labels: {[key: string]: string} = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    new_user: 'New User'
  };
  return labels[taskType] || taskType;
};

// Helper function to get referral progress text
const getReferralProgressText = (task: DoctorTask): string => {
  if (!isReferralTask(task)) return '';
  return `${task.referralCount} referral${task.referralCount !== 1 ? 's' : ''}`;
};

// Countdown Timer Component
function CountdownTimer({ 
  countdown, 
  taskId 
}: { 
  countdown: { display: string; isExpired: boolean; remainingMs: number } | null;
  taskId: number;
}) {
  const [timeLeft, setTimeLeft] = useState(countdown?.display || '00:00:00');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!countdown || countdown.isExpired) {
      setTimeLeft('00:00:00');
      setIsUrgent(true);
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      const remaining = countdown.remainingMs - 1000;
      
      if (remaining <= 0) {
        setTimeLeft('00:00:00');
        setIsUrgent(true);
        clearInterval(interval);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeLeft(display);
        setIsUrgent(remaining < 3600000); // Urgent if less than 1 hour
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  if (!countdown) return null;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
      countdown.isExpired 
        ? 'bg-red-100 text-red-700' 
        : isUrgent 
          ? 'bg-orange-100 text-orange-700' 
          : 'bg-blue-100 text-blue-700'
    }`}>
      <Timer size={16} />
      <span className="font-mono font-medium">{timeLeft}</span>
    </div>
  );
}

// Referral Modal Component (for viewing all referrals)
function ReferralModal({
  show,
  onClose,
  referrals,
  loading
}: {
  show: boolean;
  onClose: () => void;
  referrals: ReferralInfo[];
  loading: boolean;
}) {
  if (!show) return null;

  const handleWhatsappShare = (phone: string | null, name: string) => {
    if (!phone) return;
    const message = `Hi ${name}, you've been referred to our diet consultation service. Join us to get personalized diet plans!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Referrals</h2>
            <p className="text-sm text-gray-500">{referrals.length} total referrals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading referrals...</span>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">Refer new users to earn rewards</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{referral.name}</h3>
                      <p className="text-sm text-gray-500">{referral.email}</p>
                      {referral.phone && (
                        <p className="text-sm text-gray-500">{referral.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleWhatsappShare(referral.phone, referral.name)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm"
                    >
                      <Share2 size={14} />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total Referrals: <span className="font-bold">{referrals.length}</span>
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Referral Modal Component (for sharing referral code per task)
function TaskReferralModal({
  show,
  onClose,
  referralCode,
  taskTitle,
  doctorName
}: {
  show: boolean;
  onClose: () => void;
  referralCode: string | null;
  taskTitle: string;
  doctorName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<'link' | 'code'>('link');

  if (!show) return null;

  const referralLink = referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}`
    : '';

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsappShare = () => {
    const message = shareMethod === 'link'
      ? `Join me at Neutrion Diet! Use my referral link to register: ${referralLink}`
      : `Join me at Neutrion Diet! Use my referral code: ${referralCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = () => {
    if (shareMethod === 'link') {
      handleCopyLink();
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Share Referral</h2>
            <p className="text-sm text-gray-500 truncate max-w-xs">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Doctor Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">Your Referral Code</p>
            <p className="text-lg font-semibold text-gray-800">{doctorName}</p>
          </div>

          {/* Share Method Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setShareMethod('link')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                shareMethod === 'link'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Share Link
            </button>
            <button
              onClick={() => setShareMethod('code')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                shareMethod === 'code'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Share Code
            </button>
          </div>

          {/* Code/Link Display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {shareMethod === 'link' ? 'Referral Link' : 'Referral Code'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareMethod === 'link' ? referralLink : (referralCode || '')}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                title="Copy"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Share on WhatsApp */}
          <button
            onClick={handleWhatsappShare}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <Share2 size={18} />
            <span>Share on WhatsApp</span>
          </button>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Referral Modal Component - Simple referral sharing without form fields
function AddReferralModal({
  show,
  onClose,
  referralCode,
  doctorName
}: {
  show: boolean;
  onClose: () => void;
  referralCode: string | null;
  doctorName: string;
}) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [shareMethod, setShareMethod] = useState<'link' | 'code'>('link');

  if (!show) return null;

  const referralLink = referralCode 
    ? `${window.location.origin}/register?ref=${referralCode}`
    : '';

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied('code');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied('link');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const message = shareMethod === 'link'
      ? `Join me at Neutrion Diet! Use my referral link to register: ${referralLink}`
      : `Join me at Neutrion Diet! Use my referral code: ${referralCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    const subject = 'Join Neutrion Diet - My Referral';
    const body = shareMethod === 'link'
      ? `Hi,\n\nI've been using Neutrion Diet and I think you'll love it! Use my referral link to register:\n\n${referralLink}\n\nSee you there!`
      : `Hi,\n\nI've been using Neutrion Diet and I think you'll love it! Use my referral code to register:\n\n${referralCode}\n\nSee you there!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareTwitter = () => {
    const text = shareMethod === 'link'
      ? `Join me at Neutrion Diet! Use my referral link: ${referralLink}`
      : `Join me at Neutrion Diet! Use my referral code: ${referralCode}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink || '')}`;
    window.open(fbUrl, '_blank');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink || '')}`;
    window.open(linkedInUrl, '_blank');
  };

  const handleMoreShare = () => {
    if (navigator.share) {
      const shareData = {
        title: 'Neutrion Diet Referral',
        text: shareMethod === 'link'
          ? `Join me at Neutrion Diet! Use my referral link: ${referralLink}`
          : `Join me at Neutrion Diet! Use my referral code: ${referralCode}`,
        url: referralLink
      };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {});
      }
    } else {
      // Fallback: copy link
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Share Referral</h2>
            <p className="text-sm text-gray-500">Share your referral code or link</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Share Method Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setShareMethod('link')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                shareMethod === 'link'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Share Link
            </button>
            <button
              onClick={() => setShareMethod('code')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                shareMethod === 'code'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Share Code
            </button>
          </div>

          {/* Code/Link Display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {shareMethod === 'link' ? 'Your Referral Link' : 'Your Referral Code'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareMethod === 'link' ? referralLink : (referralCode || '')}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 font-mono font-bold text-sm"
              />
              <button
                onClick={shareMethod === 'link' ? handleCopyLink : handleCopyCode}
                className="px-3 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg hover:bg-blue-700 transition"
                title="Copy"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-1">
                {shareMethod === 'link' ? 'Link' : 'Code'} copied to clipboard!
              </p>
            )}
          </div>

          {/* Social Sharing Options */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
            >
              <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            {/* Email */}
            <button
              onClick={handleShareEmail}
              className="flex flex-col items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">Email</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={handleShareTwitter}
              className="flex flex-col items-center justify-center p-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition"
            >
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-xs font-medium">X / Twitter</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="flex flex-col items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
            >
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-xs font-medium">Facebook</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedIn}
              className="flex flex-col items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
            >
              <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-xs font-medium">LinkedIn</span>
            </button>

            {/* More / Share */}
            <button
              onClick={handleMoreShare}
              className="flex flex-col items-center justify-center p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorTasks({ sidebarOpen }: DoctorTasksProps) {
  const [tasks, setTasks] = useState<DoctorTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DoctorTaskStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updatingTask, setUpdatingTask] = useState<number | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showAddReferralModal, setShowAddReferralModal] = useState(false);
  const [referrals, setReferrals] = useState<ReferralInfo[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Get current user from localStorage
  const getCurrentDoctorId = (): number | null => {
    const userStr = localStorage.getItem('doctor_panel_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  // Fetch doctor's tasks
  const fetchTasks = useCallback(async () => {
    const doctorId = getCurrentDoctorId();
    if (!doctorId) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getDoctorTasks(
        doctorId,
        statusFilter || undefined,
        currentPage
      );

      if (response.success) {
        setTasks(response.data);
        setTotalPages(response.pagination.pages);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  // Fetch task stats
  const fetchStats = useCallback(async () => {
    const doctorId = getCurrentDoctorId();
    if (!doctorId) return;

    try {
      const response = await getDoctorTasks(doctorId, undefined, 1);
      
      if (response.success) {
        // Calculate stats from tasks
        const tasks = response.data;
        const newStats: TaskStats = {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'assigned' || t.status === 'accepted').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length,
          completed: tasks.filter(t => t.status === 'completed').length,
          overdue: tasks.filter(t => isOverdue(t.task?.dueDate || null, t.status)).length
        };
        setStats(newStats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch referrals
  const fetchReferrals = useCallback(async () => {
    const doctorId = getCurrentDoctorId();
    if (!doctorId) return;

    setReferralsLoading(true);
    try {
      const response = await getDoctorReferrals(doctorId);
      if (response.success) {
        setReferrals(response.data.referrals);
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    } finally {
      setReferralsLoading(false);
    }
  }, []);

  // Handle view referrals
  const handleViewReferrals = () => {
    fetchReferrals();
    setShowReferralModal(true);
  };

  // Fetch referral code on mount
  const fetchReferralCode = useCallback(async () => {
    const doctorId = getCurrentDoctorId();
    if (!doctorId) return;

    try {
      const response = await getDoctorReferralCode(doctorId);
      if (response.success) {
        setReferralCode(response.data.referralCode);
      }
    } catch (err) {
      console.error('Failed to fetch referral code:', err);
    }
  }, []);

  // Handle update task status
  const handleUpdateStatus = async (task: DoctorTask, newStatus: DoctorTaskStatus) => {
    setUpdatingTask(task.id);
    setError(null);

    try {
      const response = await updateDoctorTaskStatus(
        task.id,
        newStatus,
        updateNotes || undefined
      );

      if (response.success) {
        setSuccess(`Task status updated to ${getStatusLabel(newStatus)}`);
        setTasks(prev => 
          prev.map(t => 
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
        setExpandedTask(null);
        setUpdateNotes('');
        fetchStats();
      } else {
        setError(response.message || 'Failed to update task status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    } finally {
      setUpdatingTask(null);
    }
  };

  // Get current doctor profile
  useEffect(() => {
    const userStr = localStorage.getItem('doctor_panel_user');
    if (userStr) {
      try {
        const user: AdminUser = JSON.parse(userStr);
        setDoctorProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          category: user.category
        });
      } catch {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
    fetchStats();
    fetchReferralCode();
  }, [fetchTasks, fetchStats, fetchReferralCode]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className={`p-6 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
        <p className="text-gray-600">View and manage your assigned tasks</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={handleViewReferrals}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Users size={18} />
          <span>My Referrals</span>
        </button>
        <button
          onClick={() => {
            setShowAddReferralModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={18} />
          <span>Add Referral</span>
        </button>
        <button
          onClick={() => {
            fetchTasks();
            fetchStats();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-xl font-bold text-gray-800">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-bold text-gray-800">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-xl font-bold text-gray-800">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as DoctorTaskStatus | '');
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-sm text-gray-400 mt-1">
            {statusFilter ? 'Try changing the filter' : 'You have no tasks assigned yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              {/* Task Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-800">
                        {task.task?.title || 'Untitled Task'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      {isOverdue(task.task?.dueDate || null, task.status) && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getTaskTypeLabel(task.task?.taskType || 'daily')} Task • Due: {formatDate(task.task?.dueDate)}
                    </p>
                    {isReferralTask(task) && (
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-sm text-blue-600">
                          {getReferralProgressText(task)}
                        </p>
                        {/* Countdown Timer for referral tasks with deadline */}
                        {(task.countdown || task.task?.countdown) && (
                          <CountdownTimer 
                            countdown={task.countdown || task.task?.countdown || null} 
                            taskId={task.id} 
                          />
                        )}
                        {/* Refer Now button for active referral tasks */}
                        {task.status !== 'completed' && task.status !== 'rejected' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddReferralModal(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            <UserPlus size={14} />
                            <span>Refer Now</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.task?.priority || 'medium')}`}>
                      {(task.task?.priority || 'medium').charAt(0).toUpperCase() + (task.task?.priority || 'medium').slice(1)}
                    </span>
                    {expandedTask === task.id ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Task Details */}
              {expandedTask === task.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="border-t border-gray-200 pt-4">
                    {task.task?.description && (
                      <p className="text-sm text-gray-600 mb-4">{task.task.description}</p>
                    )}

                    {/* Task Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Assigned</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(task.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Due Date</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(task.task?.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Progress</p>
                        <p className="text-sm font-medium text-gray-800">{task.progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Referrals</p>
                        <p className="text-sm font-medium text-gray-800">{task.referralCount}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={updateNotes}
                        onChange={(e) => setUpdateNotes(e.target.value)}
                        placeholder="Add notes about this task..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {task.status === 'assigned' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(task, 'accepted');
                          }}
                          disabled={updatingTask === task.id}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm disabled:opacity-50"
                        >
                          Accept Task
                        </button>
                      )}
                      {(task.status === 'accepted' || task.status === 'in_progress') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(task, 'in_progress');
                          }}
                          disabled={updatingTask === task.id}
                          className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm disabled:opacity-50"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {task.status !== 'completed' && task.status !== 'rejected' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(task, 'completed');
                          }}
                          disabled={updatingTask === task.id}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50"
                        >
                          Complete Task
                        </button>
                      )}
                      {task.status !== 'rejected' && task.status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(task, 'rejected');
                          }}
                          disabled={updatingTask === task.id}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                        >
                          Reject Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      <ReferralModal
        show={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        referrals={referrals}
        loading={referralsLoading}
      />

      {/* Add Referral Modal */}
      <AddReferralModal
        show={showAddReferralModal}
        onClose={() => setShowAddReferralModal(false)}
        referralCode={referralCode}
        doctorName={doctorProfile?.name || 'Doctor'}
      />
    </div>
  );
}

