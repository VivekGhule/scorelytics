import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, GraduationCap, User, Phone, Calendar, BookOpen, Sparkles } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { profile, loading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [degree, setDegree] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && profile) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setIsSubmitting(true);
    try {
      const extras: any = {};
      if (phone.trim()) extras.phone = phone.trim();
      if (dateOfBirth) extras.dateOfBirth = dateOfBirth;
      if (degree.trim() || college.trim()) {
        extras.education = { degree: degree.trim() || undefined, college: college.trim() || undefined };
      }
      await register(name.trim(), email, password, extras);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-2xl shadow-lg shadow-emerald-500/25 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Join Scorelytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Create a free account to start your journey</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-8">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-start gap-2 p-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className={inputCls} /></div>
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-red-500">*</span></label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} /></div>
            </div>
            <div>
              <label htmlFor="reg-pw" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-pw" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700/50" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white/80 dark:bg-slate-900/80 text-slate-400 font-medium uppercase tracking-wider">Optional Info</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="reg-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} /></div></div>
              <div><label htmlFor="reg-dob" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth</label><div className="relative"><Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="reg-dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className={inputCls} /></div></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label htmlFor="reg-deg" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree</label><div className="relative"><BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="reg-deg" type="text" value={degree} onChange={e => setDegree(e.target.value)} placeholder="e.g. B.Tech" className={inputCls} /></div></div>
              <div><label htmlFor="reg-col" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College</label><div className="relative"><GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="reg-col" type="text" value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. IIT Delhi" className={inputCls} /></div></div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full mt-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 disabled:from-emerald-400 disabled:to-indigo-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
              {isSubmitting ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Already have an account?{' '}<Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Sign in</Link></p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
