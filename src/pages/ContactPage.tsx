import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Phone, Send, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitted(true);
    setName(''); setEmail(''); setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@scorelytics.com', color: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', color: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { icon: MapPin, label: 'Location', value: 'Pune, Maharashtra, India', color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  const inputCls = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/25 mb-6">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Touch</span></h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Have a question or feedback? We'd love to hear from you. Drop us a message and we'll get back to you shortly.</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          {contactInfo.map(c => (
            <div key={c.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{c.label}</div>
                <div className="font-semibold text-slate-900 dark:text-white">{c.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-8">
            <AnimatePresence>
              {submitted && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 p-3 mb-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>Thank you! Your message has been sent successfully.</span>
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 p-3 mb-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Your Name</label>
                <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className={inputCls} /></div>
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} /></div>
              </div>
              <div>
                <label htmlFor="contact-msg" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                <textarea id="contact-msg" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" />
              </div>
              <button type="submit" className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
