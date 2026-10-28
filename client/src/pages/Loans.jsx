import React, { useState, useEffect } from 'react';
import { loansApi, booksApi, membersApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal, ConfirmDialog, EmptyState, Loading } from '../components/Common';

export const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Available items for issuance
  const [availableBooks, setAvailableBooks] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);

  // Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Return and Delete Confirm states
  const [returnTarget, setReturnTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showToast } = useToast();

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await loansApi.getAll({
        status: statusFilter || undefined,
      });
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error fetching loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([
        booksApi.getAll({ available: 'true' }),
        membersApi.getAll({ status: 'Active' }),
      ]);
      setAvailableBooks(booksRes.data.data);
      setActiveMembers(membersRes.data.data);
    } catch (err) {
      console.error('Error loading available books or members:', err);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const handleOpenIssue = () => {
    loadDependencies();
    setSelectedBook('');
    setSelectedMember('');
    // Default 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split('T')[0]);
    setNotes('');
    setFormErrors({});
    setIsIssueModalOpen(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!selectedBook) errors.book = 'Please select a book to issue';
    if (!selectedMember) errors.member = 'Please select a member';
    if (!dueDate) errors.dueDate = 'Due date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await loansApi.create({
        bookId: selectedBook,
        memberId: selectedMember,
        dueDate,
        notes,
      });
      showToast('Book issued successfully!', 'success');
      setIsIssueModalOpen(false);
      fetchLoans();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to issue book', 'error');
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnTarget) return;
    try {
      const res = await loansApi.returnBook(returnTarget._id);
      showToast(res.data.message || 'Book returned successfully!', 'success');
      fetchLoans();
    } catch (err) {
      showToast(err.response?.data?.message || 'Return operation failed', 'error');
    } finally {
      setReturnTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await loansApi.delete(deleteTarget._id);
      showToast('Loan record removed', 'success');
      fetchLoans();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete record', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Loan Records</option>
            <option value="Active">Active Only</option>
            <option value="Overdue">Overdue Only</option>
            <option value="Returned">Returned Only</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenIssue}>
          + Issue Book to Member
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Circulation & Loan Records ({loans.length})</h3>
        </div>

        {loading ? (
          <Loading text="Loading loan transactions..." />
        ) : loans.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No Circulation Records"
            description="Issue a book to an enrolled library member to start tracking circulation"
            action={
              <button className="btn btn-primary btn-sm" onClick={handleOpenIssue}>
                + Issue Book
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Issued To</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const isLate = loan.status === 'Overdue';
                  return (
                    <tr key={loan._id}>
                      <td>
                        <strong>{loan.book?.title || 'Unknown Title'}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ISBN: {loan.book?.isbn || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div>{loan.member?.name || 'Unknown Member'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {loan.member?.membershipId || ''}
                        </div>
                      </td>
                      <td>{new Date(loan.issueDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ color: isLate ? 'var(--danger)' : 'inherit', fontWeight: isLate ? '700' : 'normal' }}>
                          {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          loan.status === 'Returned'
                            ? 'badge-success'
                            : loan.status === 'Overdue'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}>
                          {loan.status}
                        </span>
                        {loan.fine > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px', fontWeight: 600 }}>
                            Fine: ₹{loan.fine}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {loan.status !== 'Returned' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setReturnTarget(loan)}
                            >
                              ✓ Return
                            </button>
                          )}
                          {loan.status === 'Returned' && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                              onClick={() => setDeleteTarget(loan)}
                              title="Delete record"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Member"
      >
        <form onSubmit={handleIssueSubmit}>
          <div className="form-group">
            <label className="form-label">Select Book <span>*</span></label>
            <select
              className={`form-control ${formErrors.book ? 'error' : ''}`}
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">-- Choose an available book --</option>
              {availableBooks.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
            {formErrors.book && <div className="form-error">{formErrors.book}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Select Member <span>*</span></label>
            <select
              className={`form-control ${formErrors.member ? 'error' : ''}`}
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Choose an active member --</option>
              {activeMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.membershipId} - {m.membershipType})
                </option>
              ))}
            </select>
            {formErrors.member && <div className="form-error">{formErrors.member}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Due Date <span>*</span></label>
            <input
              type="date"
              className={`form-control ${formErrors.dueDate ? 'error' : ''}`}
              value={dueDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {formErrors.dueDate && <div className="form-error">{formErrors.dueDate}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Loan Remarks / Notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Condition good, issued for semester study"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Book
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Return */}
      <ConfirmDialog
        isOpen={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleConfirmReturn}
        danger={false}
        title="Confirm Return"
        confirmText="Confirm Return"
        message={`Mark "${returnTarget?.book?.title}" as returned by ${returnTarget?.member?.name}? This will restock 1 available copy in inventory.`}
      />

      {/* Delete Record */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Loan Log"
        message="Are you sure you want to delete this historical loan record? This action cannot be undone."
      />
    </div>
  );
};
