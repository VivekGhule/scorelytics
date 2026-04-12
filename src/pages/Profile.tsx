import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRepository } from '../services/testService';
import { UserProfile } from '../types';
import { User, Phone, MapPin, GraduationCap, Save, Loader2, Mars, Venus } from 'lucide-react';
import { toast } from 'sonner';
import { getProfileAvatarUrl } from '../utils/avatar';

const Profile: React.FC = () => {
  const { profile: initialProfile, refreshProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        ...initialProfile,
        gender: initialProfile.gender || 'male'
      });
    }
  }, [initialProfile]);

  // Auto-retry once if profile is missing
  useEffect(() => {
    if (!authLoading && !initialProfile && retryCount < 1) {
      const timer = setTimeout(() => {
        refreshProfile();
        setRetryCount(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, initialProfile, retryCount, refreshProfile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const payload = {
        ...profile,
        gender: profile.gender || 'male'
      };
      await UserRepository.updateProfile(profile.uid, payload);
      setProfile(payload);
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!profile && retryCount === 0)) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400">We couldn't retrieve your profile data. This might happen if your account was recently created or there's a connection issue.</p>
        <button
          onClick={() => refreshProfile()}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          Retry Loading Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your personal information, preferences, and education details.</p>
      </header>

      <form onSubmit={handleUpdate} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg mb-4">
              <img
                src={getProfileAvatarUrl(profile)}
                alt={`${profile.name} avatar`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{profile.email}</p>
            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {profile.role}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Account Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    placeholder="Mumbai, India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Profile Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: 'male' })}
                    className={`py-2 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      (profile.gender || 'male') === 'male'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Mars className="w-4 h-4" />
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: 'female' })}
                    className={`py-2 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      profile.gender === 'female'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Venus className="w-4 h-4" />
                    Female
                  </button>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Your avatar updates automatically based on this preference.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Education Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">College / University</label>
                  <input
                    type="text"
                    value={profile.education?.college || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: { ...profile.education, college: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    placeholder="Enter your college name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Degree</label>
                  <input
                    type="text"
                    value={profile.education?.degree || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: { ...profile.education, degree: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    placeholder="e.g. B.Tech, MBA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Specialization</label>
                  <input
                    type="text"
                    value={profile.education?.specialization || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: { ...profile.education, specialization: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Graduation Year</label>
                  <input
                    type="text"
                    value={profile.education?.graduationYear || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      education: { ...profile.education, graduationYear: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Profile Changes
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Ready for a Test?</h3>
              <p className="text-indigo-100 mb-6 max-w-md">Your profile helps us tailor recommendations and track your progress more accurately.</p>
              <button
                type="button"
                className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
