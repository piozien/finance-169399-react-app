import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/axios';
import './CategoryManager.css';

export const CATEGORY_CHANGED_EVENT = 'categoryChanged';

const notifyCategoryChange = (action, categoryId = null) => {
  const event = new CustomEvent(CATEGORY_CHANGED_EVENT, {
    detail: { action, categoryId }
  });
  window.dispatchEvent(event);
};

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [errorTimeout, setErrorTimeout] = useState(null);

  const checkUserEmail = () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setErrorWithTimeout('You are not logged in. Please log in again.');
      return false;
    }
    return true;
  };

  const setErrorWithTimeout = (message, duration = 5000) => {
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    
    setError(message);
    
    const timeout = setTimeout(() => {
      setError('');
    }, duration);
    
    setErrorTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorTimeout]);

  const fetchCategories = async () => {
    if (!checkUserEmail()) return;

    try {
      console.log('Fetching categories...');
      const response = await getCategories();
      console.log('Retrieved categories:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setErrorWithTimeout('Failed to fetch categories: ' + errorMessage);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!checkUserEmail()) return;

    if (!newCategoryName.trim()) {
      setErrorWithTimeout('Category name cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      const response = await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      setCategories(prevCategories => [...prevCategories, response.data]);
      setErrorWithTimeout('Category has been successfully added', 3000);
      notifyCategoryChange('create', response.data.id);
    } catch (error) {
      console.error('Error details during addition:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setErrorWithTimeout('Failed to add category: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setError('');
  };

  const handleUpdateCategory = async (e, categoryId) => {
    e.preventDefault();
    if (!checkUserEmail()) return;

    if (!editName.trim()) {
      setErrorWithTimeout('Category name cannot be empty');
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateCategory(categoryId, { name: editName.trim() });
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.id === categoryId ? response.data : cat
        )
      );
      setEditingCategory(null);
      setEditName('');
      setErrorWithTimeout('Category has been successfully updated', 3000);
      notifyCategoryChange('update', categoryId);
    } catch (error) {
      console.error('Error during update:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setErrorWithTimeout('Failed to update category: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!checkUserEmail()) return;

    setDeletingCategoryId(categoryId);
    setIsLoading(true);

    try {
      await deleteCategory(categoryId);
      setCategories(prevCategories =>
        prevCategories.filter(cat => cat.id !== categoryId)
      );
      setErrorWithTimeout('Category has been successfully deleted', 3000);
      notifyCategoryChange('delete', categoryId);
    } catch (error) {
      console.error('Error during deletion:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setErrorWithTimeout('Failed to delete category: ' + errorMessage);
    } finally {
      setIsLoading(false);
      setDeletingCategoryId(null);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="category-manager">
      {error && <div className="error-message-fixed">{error}</div>}
      
      <div className="category-header" onClick={toggleExpanded}>
        <h2>Category Management</h2>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>&#9650;</span>
      </div>
      
      <div className={`category-content ${isExpanded ? 'expanded' : ''}`}>
        <form onSubmit={handleAddCategory} className="category-form">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Category'}
          </button>
        </form>

        <div className="categories-list">
          {categories.length === 0 ? (
            <p>No categories</p>
          ) : (
            <ul>
              {categories.map((category) => (
                <li key={category.id} className="category-item">
                  {editingCategory?.id === category.id ? (
                    <form onSubmit={(e) => handleUpdateCategory(e, category.id)} className="category-edit">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Category name"
                        disabled={isLoading}
                      />
                      <div className="edit-buttons">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="save-button"
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="cancel-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="category-name">{category.name}</span>
                      <div className="category-actions">
                        <button
                          onClick={() => handleStartEdit(category)}
                          disabled={isLoading || deletingCategoryId === category.id}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isLoading || deletingCategoryId === category.id}
                          className="delete-button"
                        >
                          {deletingCategoryId === category.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryManager;
