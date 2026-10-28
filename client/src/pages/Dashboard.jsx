import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, loansApi } from '../services/api';
import { DbmsConceptsPanel } from '../components/DbmsConceptsPanel';
import { Loading } from '../components/Common';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loading text="Loading dashboard metrics..." />;

  return (
    <div>
      <DbmsConceptsPanel />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#6366f1' }}>📚</div>
          <div className="stat-info">
            <h4>{stats?.totalBooks || 0}</h4>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>👥</div>
          <div className="stat-info">
            <h4>{stats?.totalMembers || 0}</h4>
            <p>Active Members</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>🔖</div>
          <div className="stat-info">
            <h4>{stats?.activeLoans || 0}</h4>
            <p>Active Loans</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>⚠️</div>
          <div className="stat-info">
            <h4>{stats?.overdueLoans || 0}</h4>
            <p>Overdue Books</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* System & Database Status */}
        <div className="card">
          <div className="card-header">
            <h3>🗄️ Database Connection</h3>
            <span className="badge badge-success">Live MongoDB</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database Name</span>
                <strong>{stats?.dbInfo?.name || 'library_management'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Host</span>
                <code>{stats?.dbInfo?.host || 'localhost'}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Connection Status</span>
                <span className="badge badge-success">{stats?.dbInfo?.status || 'Connected'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Collections</span>
                <span>books, members, loans</span>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Link to="/admin" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                View MongoDB Users & Roles Guide →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3>🕒 Recent Loans Activity</h3>
            <Link to="/loans" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {(!stats?.recentLoans || stats.recentLoans.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No recent loan activity found.
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Member</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLoans.map((loan) => (
                      <tr key={loan._id}>
                        <td>
                          <strong>{loan.book?.title || 'Unknown Title'}</strong>
                        </td>
                        <td>{loan.member?.name || 'Unknown Member'}</td>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
