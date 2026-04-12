import React, { useEffect, useState } from 'react';
import { UserRepository } from '../services/testService';
import apiClient from '../services/apiClient';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Trash2, Shield, Search, X, Mail, Calendar, Plus, Key } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getProfileAvatarUrl } from '../utils/avatar';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
  gender?: 'male' | 'female';
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastSeenAt?: string | null;
  isActive?: boolean;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await UserRepository.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.password || newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      // Register endpoint creates users as USER.
      // Promote-to-admin flow is intentionally removed.
      await apiClient.post('/auth/register', {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
      });

      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setNewUser({ email: '', name: '', password: '' });
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to create user';
      console.error('Failed to create user', error);
      toast.error(msg);
    }
  };

  const handleDemoteToUser = async (user: UserProfile) => {
    if (user.role !== 'ADMIN') return;

    try {
      await UserRepository.update(user.uid, { role: 'USER' });
      toast.success('User role updated to USER');
      fetchUsers();
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...user, role: 'USER' });
      }
    } catch (error) {
      console.error('Failed to update role', error);
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await UserRepository.delete(uid);
      toast.success('User deleted successfully');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage user accounts and permissions.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user, idx) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedUser(user)}
                className={`bg-white p-4 rounded-2xl shadow-sm border transition-all cursor-pointer flex items-center gap-4 group ${
                  selectedUser?.uid === user.uid ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-100 hover:border-indigo-200'
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img src={getProfileAvatarUrl(user)} alt={`${user.name} avatar`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 truncate">{user.name || 'Anonymous User'}</h3>
                    {user.isActive && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        Active
                      </span>
                    )}
                    {user.role === 'ADMIN' && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user.uid);
                    }}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete user"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                key={selectedUser.uid}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-8"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 mb-4 shadow-lg">
                    <img src={getProfileAvatarUrl(selectedUser)} alt={`${selectedUser.name} avatar`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedUser.name || 'Anonymous User'}</h2>
                  <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedUser.email}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      Joined on {selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'PPP') : 'Unknown'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Shield className="w-4 h-4" />
                      Role: <span className="font-bold text-slate-900">{selectedUser.role}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedUser.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDemoteToUser(selectedUser)}
                        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        <UserIcon className="w-5 h-5" />
                        Demote to User
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedUser.uid)}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 sticky top-8">
                <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Select a user to view details and manage permissions</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsers;
