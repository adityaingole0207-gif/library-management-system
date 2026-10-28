import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

export const Admin = () => {
  const { showToast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Command copied to clipboard!', 'info', 2000);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const adminSections = [
    {
      title: '1. Connect as Root / Admin User',
      description: 'Before creating project users, connect to your MongoDB instance using mongosh with an administrative user account on the "admin" database.',
      code: `mongosh "mongodb://adminUsername:<admin_password_placeholder>@localhost:27017/admin?authSource=admin"`,
      explanation: 'Notice `authSource=admin`: authentication credentials for administrative server accounts are verified against MongoDB\'s internal admin authentication database.',
    },
    {
      title: '2. Switch to Project Database',
      description: 'Switch context to the target database where the library documents and collections reside.',
      code: `use library_management`,
      explanation: 'In MongoDB, `use <dbname>` switches the active database namespace. If the database does not yet exist, MongoDB will lazily create it when documents are first saved.',
    },
    {
      title: '3. Create Application User (readWrite)',
      description: 'Create a dedicated user for your Node.js application server. Following the Principle of Least Privilege, the app server should only have readWrite access to library_management.',
      code: `db.createUser({
  user: "library_app_user",
  pwd: "<strong_app_password_placeholder>",
  roles: [
    { role: "readWrite", db: "library_management" }
  ]
})`,
      explanation: 'The `readWrite` built-in role provides all privileges of the `read` role plus permission to insert, update, and remove documents in collections of `library_management`.',
    },
    {
      title: '4. Create Read-Only Audit / Reporter User',
      description: 'Useful for staff or analysts who need to run queries and generate reports without risk of mutating or dropping data.',
      code: `db.createUser({
  user: "library_reporter",
  pwd: "<reporter_password_placeholder>",
  roles: [
    { role: "read", db: "library_management" }
  ]
})`,
      explanation: 'The `read` role restricts the user strictly to querying documents and viewing collection indexes.',
    },
    {
      title: '5. Granting Additional Roles (Assign Roles)',
      description: 'Add a new role or privilege to an existing user without recreating the user account.',
      code: `db.grantRolesToUser(
  "library_reporter",
  [ { role: "dbAdmin", db: "library_management" } ]
)`,
      explanation: '`dbAdmin` grants index management, stats inspection, and compaction rights on this specific database without elevating to global cluster admin privileges.',
    },
    {
      title: '6. Revoking Roles from a User',
      description: 'Remove previously assigned roles when permissions need to be restricted.',
      code: `db.revokeRolesFromUser(
  "library_reporter",
  [ { role: "dbAdmin", db: "library_management" } ]
)`,
      explanation: '`revokeRolesFromUser` removes specific roles while keeping the user account active and keeping other existing roles intact.',
    },
    {
      title: '7. Changing User Password',
      description: 'Rotate credentials periodically or update forgotten passwords.',
      code: `db.changeUserPassword(
  "library_app_user",
  "<new_secure_password_placeholder>"
)`,
      explanation: 'Allows updating the user\'s credential hash in system collections without dropping existing role configurations.',
    },
    {
      title: '8. Deleting a Database User',
      description: 'Drop an obsolete or offboarded user from the database.',
      code: `db.dropUser("library_reporter")`,
      explanation: 'Drops the user completely from `system.users` for the current database context. Active sessions for this user will fail on their next authenticated action.',
    },
  ];

  return (
    <div>
      {/* Important Disclaimer Banner */}
      <div className="alert alert-warning" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '24px' }}>🛡️</span>
        <div>
          <h4 style={{ margin: 0, fontWeight: 700 }}>Educational Security Notice</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            The commands shown below are <strong>interactive administrative examples</strong> designed to be executed by a Database Administrator in <code>mongosh</code> (the MongoDB Shell).
            For security, web applications <strong>never</strong> expose server user-management commands or store administrative credentials in client-side code.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Understanding MongoDB RBAC (Role-Based Access Control)</h3>
          <span className="badge badge-purple">DBMS Curriculum</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            MongoDB utilizes <strong>Role-Based Access Control (RBAC)</strong> to secure data. Each user account is granted one or more roles that define specific actions (privileges) permitted on specific database resources. Built-in roles include:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--primary)' }}>read</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Read data and view indexes on non-system collections.</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--success)' }}>readWrite</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>All <code>read</code> actions plus insert, update, and remove documents.</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--warning)' }}>dbAdmin</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Administrative actions such as index creation and viewing database stats.</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--danger)' }}>userAdmin</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Ability to create and modify users and custom roles on the database.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>MongoDB Shell Administrator Command Reference</h3>
          <span className="badge badge-info">mongosh Commands</span>
        </div>
        <div className="card-body">
          {adminSections.map((sec, idx) => (
            <div key={sec.title} style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: idx < adminSections.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px' }}>{sec.title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{sec.description}</p>
              
              <div className="code-block">
                <button
                  type="button"
                  className={`copy-btn ${copiedIndex === idx ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(sec.code, idx)}
                >
                  {copiedIndex === idx ? '✓ Copied' : '📋 Copy'}
                </button>
                <code>{sec.code}</code>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                💡 <strong>Explanation:</strong> {sec.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
