'use client';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { client } from '@/sanity/client';
import './style.scss';

interface ModalCategorySelectorProps {
  dates: Date[];
  onConfirm: (selected: { [date: string]: string[] }) => void;
  onClose: () => void;
}

interface Category {
  _id: string;
  title: string;
}

export default function ModalCategorySelector({ dates, onConfirm, onClose }: ModalCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<{ [date: string]: string[] }>({});

  useEffect(() => {
    async function fetchCategories() {
      const data = await client.fetch<Category[]>(`*[_type == "blogCategory" && i18n_lang == "en"]{_id, title}`);
      setCategories(data);
    }
    fetchCategories();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (date: string, selectedOptions: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedIds = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setSelectedCategories(prev => ({ ...prev, [date]: selectedIds }));
  };

  const handleConfirm = () => {
    onConfirm(selectedCategories);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <h2>Select Categories for Each Article</h2>
        <div className="modal__list">
          {dates.map(dateObj => {
            const dateKey = dateObj.toISOString().split('T')[0];
            return (
              <div key={dateKey} className="modal__item">
                <p className="modal__date">{dateKey}</p>
                <Select
                  isMulti
                  options={categories.map(cat => ({ value: cat._id, label: cat.title }))}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(selected: any) => handleChange(dateKey, selected)}
                />
              </div>
            );
          })}
        </div>
        <div className="modal__actions">
          <button onClick={handleConfirm} className="btn btn-primary">Confirm</button>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
