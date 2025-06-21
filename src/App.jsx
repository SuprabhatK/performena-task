import React, { useState, useRef } from 'react';
import './App.css';

const fields = [
  { name: 'fullName', label: 'Full Name', validate: val => val.length >= 3, error: 'Minimum 3 characters required' },
  { name: 'phone', label: 'Phone', validate: val => /^\d{10}$/.test(val), error: 'Enter a valid 10-digit number' },
  { name: 'email', label: 'Email', validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), error: 'Enter a valid email address' },
  { name: 'city', label: 'City', validate: val => val.length >= 3, error: 'Minimum 3 characters required' },
  { name: 'sport', label: 'Favorite Sport', validate: val => val.trim() !== '', error: 'Cannot be empty' },
  { name: 'team', label: 'Favorite Team', validate: val => val.trim() !== '', error: 'Cannot be empty' },
  { name: 'icon', label: 'Favorite Sports Icon', validate: val => val.trim() !== '', error: 'Cannot be empty' }
];

export default function App() {
  const [formData, setFormData] = useState({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [shake, setShake] = useState(false);
  const [animateUp, setAnimateUp] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);


  const inputRef = useRef(null);
  const currentField = fields[index];

  const handleSubmitField = (e) => {
    e.preventDefault();
    const value = inputRef.current.value.trim();

    if (!currentField.validate(value)) {
      setError(currentField.error);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Check for duplicate email before proceeding
    if (currentField.name === 'email') {
      const existingData = JSON.parse(localStorage.getItem('registrations')) || [];
      const exists = existingData.some(user => user.email.toLowerCase() === value.toLowerCase());

      if (exists) {
        setError('This email ID is already registered.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        inputRef.current.value = '';
        return;
      }
    }

    setError('');
    setAnimateUp(true);

    setTimeout(() => {
      setFormData(prev => ({ ...prev, [currentField.name]: value }));
      setAnimateUp(false);

      if (index < fields.length - 1) {
        setIndex(index + 1);
        inputRef.current.value = '';
      } else {
        setSubmitted(true);
        setSaved(false);
      }
    }, 400);
  };

  const handleEdit = () => {
    setEditedData(formData);
    setEditMode(true);
    setFieldErrors({});
    setSaved(false);
  };

  const handleEditSave = () => {
    const newErrors = {};
    const emailValue = editedData['email']?.trim() || '';

    // validate all fields
    fields.forEach(field => {
      const value = editedData[field.name]?.trim() || '';
      if (!field.validate(value)) {
        newErrors[field.name] = field.error;
      }
    });

    // check duplicate email if changed
    if (emailValue !== formData.email) {
      const existingData = JSON.parse(localStorage.getItem('registrations')) || [];
      const exists = existingData.some(user => user.email.toLowerCase() === emailValue.toLowerCase());
      if (exists) {
        newErrors['email'] = 'This email ID is already registered.';
      }
    }

    // if errors, block save
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFormData(editedData);
    setEditMode(false);
    setFieldErrors({});
  };


  const handleFinalSave = () => {
    const existingData = JSON.parse(localStorage.getItem('registrations')) || [];
    existingData.push(formData);
    localStorage.setItem('registrations', JSON.stringify(existingData));
    setSaved(true);
  
    setShowThankYou(true);
  
    setTimeout(() => {
      setFormData({});
      setIndex(0);
      setSubmitted(false);
      setError('');
      setSaved(false);
      inputRef.current && (inputRef.current.value = '');
      setShowThankYou(false);
    }, 3000);
  };
  

  return (
    <div className={`form-container ${submitted ? 'wide' : ''}`}>
      {!submitted ? (
        <form onSubmit={handleSubmitField} className="form">
          <div className={`field-wrapper ${animateUp ? 'animate-field' : ''} ${shake ? 'shake' : ''}`}>
            <label>{currentField.label}</label>
            <input ref={inputRef} name={currentField.name} autoFocus />
            {error && <div className="error">{error}</div>}
            <button type="submit">Next</button>
          </div>
        </form>
      ) : showThankYou ? (
        <div className="summary">
          <h3>Thank you for registering with us!</h3>
        </div>
      ) : (
        <div className="summary">
            {!editMode && <h2 className="summary-title">Summary</h2>}
          <div className="actions">
            {!editMode ? (
              <button onClick={handleEdit}>Edit</button>
            ) : (
              <button onClick={handleEditSave}>Save</button>
            )}
            {!editMode && (
              <button onClick={handleFinalSave}>Submit</button>
            )}
          </div>

          {fields.map(field => (
            <div key={field.name} className="summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <label><strong>{field.label}:</strong></label>
              {editMode ? (
                <>
                  <input
                    value={editedData[field.name] || ''}
                    onChange={(e) =>
                      setEditedData(prev => ({ ...prev, [field.name]: e.target.value }))
                    }
                  />
                  {fieldErrors[field.name] && <div className="error">{fieldErrors[field.name]}</div>}
                </>
              ) : (
                <span>{formData[field.name]}</span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
