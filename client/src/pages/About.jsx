import React from 'react';

export const About = () => {
  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>📖 Library Management System with Database User & Role Administration</h3>
          <span className="badge badge-success">DBMS Mini-Project</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            This application is designed as a beginner-friendly academic project demonstrating fundamental
            <strong> Database Management System (DBMS)</strong> principles using modern NoSQL architecture. It covers full CRUD workflows, referential integrity via object references, query filters, aggregate metrics, and administrative database security practices.
          </p>

          <div className="divider" />

          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>🎯 Core Project Objectives</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <li>Design and model normalized schemas in MongoDB using Mongoose (Books, Members, Loans).</li>
            <li>Implement business rules: stock checking, due dates, automated overdue calculations, and return late fines.</li>
            <li>Demonstrate database authentication and Role-Based Access Control (RBAC) via the MongoDB Shell.</li>
            <li>Provide an intuitive, responsive user interface suitable for college project evaluation and viva demos.</li>
          </ul>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3>💻 Technology Stack</h3>
          </div>
          <div className="card-body" style={{ fontSize: '14px', lineHeight: 1.8 }}>
            <div><strong>Frontend:</strong> React 18, React Router v6, Vite, Vanilla CSS</div>
            <div><strong>Backend:</strong> Node.js, Express.js REST API</div>
            <div><strong>Database:</strong> MongoDB Community Edition</div>
            <div><strong>ODM:</strong> Mongoose 7 (Schemas, Validation, Middleware)</div>
            <div><strong>Environment:</strong> dotenv (.env configuration)</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🗄️ Database Schemas</h3>
          </div>
          <div className="card-body" style={{ fontSize: '14px', lineHeight: 1.8 }}>
            <div><strong>Book:</strong> title, author, isbn (unique), genre, totalCopies, availableCopies</div>
            <div><strong>Member:</strong> name, email (unique), membershipId, membershipType, status</div>
            <div><strong>Loan:</strong> book (ref), member (ref), issueDate, dueDate, returnDate, status, fine</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>🎓 Viva & Presentation Checklist</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
              <div>
                <strong>Schema Validation:</strong> Explain how Mongoose validates ISBN formats, email addresses, and prevents duplicate unique keys.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
              <div>
                <strong>Referential Integrity:</strong> Show how a book or member cannot be deleted while they have an active circulation loan.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
              <div>
                <strong>Role-Based Security:</strong> Present the Database Administration page to explain MongoDB's <code>readWrite</code> vs <code>read</code> vs <code>dbAdmin</code> permissions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
