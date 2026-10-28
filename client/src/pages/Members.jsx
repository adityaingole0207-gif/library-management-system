import React, { useState, useEffect } from 'react';
import { membersApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal, ConfirmDialog, EmptyState, Loading } from '../components/Common';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  membershipType: 'Student',
  status: 'Active',
};

export const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Confirm Delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showToast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await membersApi.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error fetching members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      membershipType: member.membershipType || 'Student',
      status: member.status || 'Active',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingId) {
        await membersApi.update(editingId, formData);
        showToast('Member profile updated!', 'success');
      } else {
        await membersApi.create(formData);
        showToast('Member enrolled successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await membersApi.delete(deleteTarget._id);
      showToast('Member deleted successfully', 'success');
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete member', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '600px' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search members by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Register Member
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Registered Members ({members.length})</h3>
        </div>

        {loading ? (
          <Loading text="Loading members list..." />
        ) : members.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Members Found"
            description={search ? "No members match the query" : "Register students or faculty to get started"}
            action={
              <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                + Register Member
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name & Contact</th>
                  <th>Category</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <code style={{ fontSize: '13px', background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {m.membershipId || 'PENDING'}
                      </code>
                    </td>
                    <td>
                      <div>
                        <strong>{m.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {m.email} {m.phone ? `• ${m.phone}` : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{m.membershipType}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        m.status === 'Active' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEdit(m)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          onClick={() => setDeleteTarget(m)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Member Info' : 'New Member Registration'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span>*</span></label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? 'error' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address <span>*</span></label>
              <input
                type="email"
                className={`form-control ${formErrors.email ? 'error' : ''}`}
                placeholder="name@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Membership Category</label>
              <select
                className="form-control"
                value={formData.membershipType}
                onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
                <option value="Public">Public</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address / Department</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Campus hostel, room number or residential address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete member record for "${deleteTarget?.name}"? You cannot delete members with active loans.`}
      />
    </div>
  );
};
