import React, { useState, useEffect } from 'react';
import { booksApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal, ConfirmDialog, EmptyState, Loading } from '../components/Common';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
  'Biography', 'Self-Help', 'Romance', 'Mystery', 'Fantasy',
  'Science Fiction', 'Horror', 'Children', 'Education', 'Other',
];

const initialForm = {
  title: '',
  author: '',
  isbn: '',
  genre: 'Technology',
  publisher: '',
  publishedYear: new Date().getFullYear(),
  totalCopies: 1,
  description: '',
  coverColor: '#4f46e5',
};

export const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  
  // Confirm Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showToast } = useToast();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll({
        search: search.trim() || undefined,
        genre: selectedGenre || undefined,
      });
      if (res.data.success) {
        setBooks(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error fetching books', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, selectedGenre]);

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author is required';
    if (!formData.isbn.trim()) {
      errors.isbn = 'ISBN is required';
    } else if (!/^[\d-]{10,17}$/.test(formData.isbn.trim())) {
      errors.isbn = 'ISBN should be 10-17 characters (numbers & hyphens)';
    }
    if (!formData.genre) errors.genre = 'Genre is required';
    if (formData.totalCopies < 1) errors.totalCopies = 'Must have at least 1 copy';
    return errors;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setEditingId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || new Date().getFullYear(),
      totalCopies: book.totalCopies,
      description: book.description || '',
      coverColor: book.coverColor || '#4f46e5',
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
        await booksApi.update(editingId, formData);
        showToast('Book updated successfully!', 'success');
      } else {
        await booksApi.create(formData);
        showToast('Book added successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await booksApi.delete(deleteTarget._id);
      showToast('Book deleted successfully', 'success');
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete book', 'error');
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
              placeholder="Search books by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: '160px' }}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Add New Book
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Catalog ({books.length} Books)</h3>
        </div>

        {loading ? (
          <Loading text="Loading library catalog..." />
        ) : books.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No Books Found"
            description={search ? "Try adjusting your search criteria" : "Add your first book to populate the inventory"}
            action={
              <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                + Add Book
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="book-cover" style={{ background: book.coverColor || '#4f46e5' }}>
                          📖
                        </div>
                        <div>
                          <strong>{book.title}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            by {book.author} ({book.publishedYear || 'N/A'})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{book.genre}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                        {book.isbn}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${book.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {book.availableCopies} / {book.totalCopies} Available
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEdit(book)}
                          title="Edit Book"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          onClick={() => setDeleteTarget(book)}
                          title="Delete Book"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Book Record' : 'Add New Book'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Book Title <span>*</span></label>
            <input
              type="text"
              className={`form-control ${formErrors.title ? 'error' : ''}`}
              placeholder="e.g. Clean Architecture"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {formErrors.title && <div className="form-error">{formErrors.title}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Author <span>*</span></label>
              <input
                type="text"
                className={`form-control ${formErrors.author ? 'error' : ''}`}
                placeholder="Author full name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
              {formErrors.author && <div className="form-error">{formErrors.author}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">ISBN <span>*</span></label>
              <input
                type="text"
                className={`form-control ${formErrors.isbn ? 'error' : ''}`}
                placeholder="978-0-12345-678-9"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
              {formErrors.isbn && <div className="form-error">{formErrors.isbn}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Genre <span>*</span></label>
              <select
                className="form-control"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Copies <span>*</span></label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Publisher</label>
              <input
                type="text"
                className="form-control"
                placeholder="Publisher Name"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Publication Year</label>
              <input
                type="number"
                max={new Date().getFullYear()}
                className="form-control"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) || 2024 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Synopsis</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Brief summary of the book..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone if there are no active loans.`}
      />
    </div>
  );
};
