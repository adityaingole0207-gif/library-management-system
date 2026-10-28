import React, { useState } from 'react';

const concepts = [
  {
    title: 'Database vs Collection',
    summary: 'A Database holds collections. A Collection is like a table in SQL, holding multiple JSON-like documents.',
    detail: 'In MongoDB, databases contain collections. Collections don\'t enforce rigid column schemas like SQL, but in our project Mongoose provides structure, types, and schema validation.',
  },
  {
    title: 'Documents & BSON',
    summary: 'Data is stored in BSON (Binary JSON) documents. Each record has a unique _id field.',
    detail: 'Unlike SQL rows with rigid columns, documents are flexible nested key-value structures. Mongoose maps our JS objects directly to BSON documents.',
  },
  {
    title: 'MongoDB Users & Roles',
    summary: 'Authentication and Role-Based Access Control (RBAC) safeguard database resources.',
    detail: 'MongoDB lets you create users scoped to specific databases (or the admin db) and assign built-in or custom roles like read, readWrite, dbAdmin, and userAdmin.',
  },
  {
    title: 'Referencing & Relationships',
    summary: 'Normalized references via ObjectId link collections like Loans pointing to Books and Members.',
    detail: 'Our Loan schema uses `type: mongoose.Schema.Types.ObjectId, ref: \'Book\'`. We populate these references to perform document joins similar to SQL foreign keys.',
  },
];

export const DbmsConceptsPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎓</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px' }}>DBMS Concepts Quick Reference</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Core concepts for student presentations & viva evaluations
            </p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button">
          {expanded ? '▲ Hide' : '▼ View Concepts'}
        </button>
      </div>

      {expanded && (
        <div className="card-body">
          <div className="tabs" style={{ marginBottom: '16px' }}>
            {concepts.map((c, idx) => (
              <button
                key={c.title}
                className={`tab ${activeTab === idx ? 'active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {c.title}
              </button>
            ))}
          </div>

          <div className="concept-card" style={{ margin: 0 }}>
            <h4>💡 {concepts[activeTab].title}</h4>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>{concepts[activeTab].summary}</p>
            <p style={{ margin: 0, opacity: 0.9 }}>{concepts[activeTab].detail}</p>
          </div>
        </div>
      )}
    </div>
  );
};
