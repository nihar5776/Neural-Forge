import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Search, ShieldAlert, UserCheck, Trash2, Eye, RefreshCw, 
  X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import '../../admin.css';

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const query = `?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}`;
      const res = await api.get(`/api/admin/users${query}`);
      const data = res.data || {};
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to retrieve users list.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on filter changes or page changes
  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset page to 1 for new search
    fetchUsers();
  };

  const handleSuspend = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to suspend "${name}"? Suspended users will be immediately locked out of the system.`)) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/users/${userId}/suspend`);
      setSuccess(`Account for "${name}" has been suspended.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to suspend ${name}.`);
    }
  };

  const handleActivate = async (userId, name) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/users/${userId}/activate`);
      setSuccess(`Account for "${name}" has been activated.`);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to activate ${name}.`);
    }
  };

  const handleDelete = async (userId, name) => {
    if (userId === currentUser?._id) {
      setError("Privilege Protection Error: You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete user "${name}"? This action will cascade-delete all their resumes, ATS reports, interviews, and session logs. This is irreversible!`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setSuccess(`User "${name}" has been permanently deleted.`);
      setPage(1);
      fetchUsers();
    } catch (err) {
      setError(err.message || `Failed to delete ${name}.`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>User Management</h1>
          <p>Suspend, activate, delete, and inspect registered system accounts</p>
        </div>
      </div>

      {error && (
        <div className="auth-error-alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-success-alert" style={{ marginBottom: '20px' }}>
          <CheckCircle size={18} style={{ marginRight: '8px' }} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="table-card" style={{ padding: '16px 20px', borderBottom: 'none' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--admin-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-field"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <select 
            value={roleFilter} 
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="select-dropdown-field"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin Only</option>
            <option value="user">User Only</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="select-dropdown-field"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button type="submit" className="pagination-btn" style={{ padding: '8px 16px' }} disabled={loading}>
            Search
          </button>
        </form>
      </div>

      {/* User Records Table */}
      <div className="table-card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
              <RefreshCw className="spinner" size={28} style={{ color: 'var(--admin-primary)' }} />
              <p style={{ marginLeft: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
              No accounts matching search criteria were found.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{formatDate(u.lastActiveAt)}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="pagination-btn" 
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="View Account Details"
                        >
                          <Eye size={14} />
                          <span>Inspect</span>
                        </button>

                        {u.status === 'active' ? (
                          <button 
                            onClick={() => handleSuspend(u._id, u.name)}
                            className="pagination-btn" 
                            style={{ padding: '4px 8px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--admin-danger)' }}
                            title="Suspend User"
                          >
                            <ShieldAlert size={14} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(u._id, u.name)}
                            className="pagination-btn" 
                            style={{ padding: '4px 8px', borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--admin-success)' }}
                            title="Activate User"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}

                        <button 
                          onClick={() => handleDelete(u._id, u.name)}
                          className="pagination-btn" 
                          style={{ 
                            padding: '4px 8px', 
                            borderColor: u._id === currentUser?._id ? 'transparent' : 'rgba(239, 68, 68, 0.1)', 
                            opacity: u._id === currentUser?._id ? 0.3 : 1, 
                            cursor: u._id === currentUser?._id ? 'not-allowed' : 'pointer'
                          }}
                          disabled={u._id === currentUser?._id}
                          title={u._id === currentUser?._id ? "You cannot delete yourself" : "Delete Account"}
                        >
                          <Trash2 size={14} style={{ color: 'var(--admin-danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Section */}
        <div className="pagination-container">
          <span style={{ fontSize: '13px', color: 'var(--admin-text-muted)', fontWeight: 500 }}>
            Showing <strong>{users.length}</strong> of <strong>{totalUsers}</strong> accounts
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
              disabled={page === 1}
              className="pagination-btn"
              style={{ display: 'flex', alignItems: 'center', padding: '6px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', color: 'var(--admin-text-muted)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={page === totalPages}
              className="pagination-btn"
              style={{ display: 'flex', alignItems: 'center', padding: '6px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Modal */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Account Telemetry Details</h3>
              <button onClick={() => setSelectedUser(null)} className="admin-modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Database Object ID</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedUser._id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Full Name</span>
                  <span style={{ fontWeight: 600 }}>{selectedUser.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Email Address</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Role Setting</span>
                  <span className={`badge ${selectedUser.role === 'admin' ? 'badge-info' : 'badge-success'}`}>{selectedUser.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Account State</span>
                  <span className={`badge ${selectedUser.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{selectedUser.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Last Activity Clocked</span>
                  <span>{formatDate(selectedUser.lastActiveAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>Profile Created On</span>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button onClick={() => setSelectedUser(null)} className="pagination-btn">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
