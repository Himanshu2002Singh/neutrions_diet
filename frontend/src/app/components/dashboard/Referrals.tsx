import { useState, useEffect } from 'react';
import { Gift, Users, Copy, CheckCircle, Clock, Share2, Trophy } from 'lucide-react';
import { apiService, UserReferrals } from '../../../services/api';

interface ReferralsProps {
  onHeaderChange?: (title: string) => void;
}

export default function Referrals({ onHeaderChange }: ReferralsProps) {
  const [referralData, setReferralData] = useState<UserReferrals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Update header title when this component mounts
    onHeaderChange?.('Referrals');
    fetchReferralData();
    
    // Cleanup - restore default header on unmount
    return () => {
      onHeaderChange?.('Dashboard');
    };
  }, [onHeaderChange]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getMyReferrals();
      if (response.success && response.data) {
        setReferralData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referral data');
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, isLink: boolean = false) => {
    await navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = () => {
    if (referralData?.referralLink) {
      if (navigator.share) {
        navigator.share({
          title: 'Join me on Neutrion Diet!',
          text: 'Use my referral link to sign up and get started with your health journey!',
          url: referralData.referralLink,
        });
      } else {
        copyToClipboard(referralData.referralLink, true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#C5E17A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchReferralData}
          className="mt-4 px-4 py-2 bg-[#C5E17A] text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C5E17A]/20 rounded-full mb-4">
          <Gift className="w-8 h-8 text-[#7aa33e]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Refer & Earn Rewards</h2>
        <p className="text-gray-600 mt-2">
          Share your referral code with friends and earn rewards when they join!
        </p>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-r from-[#C5E17A] to-[#a8c96a] rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-green-900/70 text-sm mb-1">Your Referral Code</p>
            <p className="text-4xl font-bold font-mono tracking-wider text-green-900">
              {referralData?.referralCode || 'Generate a code'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => copyToClipboard(referralData?.referralCode || '')}
              className="flex items-center gap-2 px-4 py-2 bg-white/30 hover:bg-white/40 rounded-lg transition-colors text-green-900"
            >
              {copied ? (
                <>
                  <CheckCircle size={18} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={shareReferral}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#7aa33e] rounded-lg hover:bg-green-50 transition-colors"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        {/* Referral Link */}
        {referralData?.referralLink && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-green-900/70 text-xs mb-2">Or share your referral link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralData.referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-white/20 rounded-lg text-green-900 text-sm truncate"
              />
              <button
                onClick={() => copyToClipboard(referralData.referralLink, true)}
                className="px-3 py-2 bg-white/30 hover:bg-white/40 rounded-lg transition-colors text-green-900 text-sm"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#C5E17A]/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#7aa33e]" />
            </div>
            <span className="text-sm text-gray-600">Total Referrals</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{referralData?.totalReferrals || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{referralData?.completedReferrals || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{referralData?.pendingReferrals || 0}</p>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">Referred Users</h3>
        </div>
        {referralData?.referredUsers && referralData.referredUsers.length > 0 ? (
          <div className="divide-y">
            {referralData.referredUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#C5E17A]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#7aa33e] font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {user.status === 'completed' ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <Clock size={16} className="text-yellow-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        user.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {user.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No referrals yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Share your code to start referring friends!
            </p>
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How it Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-[#C5E17A]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-[#7aa33e] font-bold">1</span>
            </div>
            <p className="text-sm text-gray-600">Share your referral code with friends and family</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-[#C5E17A]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-[#7aa33e] font-bold">2</span>
            </div>
            <p className="text-sm text-gray-600">Friends sign up using your code</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-[#C5E17A]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5 text-[#7aa33e]" />
            </div>
            <p className="text-sm text-gray-600">Earn amazing rewards when they join!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

