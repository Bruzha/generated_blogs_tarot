// 'use client';

// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom';
// import Select from 'react-select';
// import { client } from '@/sanity/client';
// import './style.scss';

// interface ModalCategorySelectorProps {
//   dates: Date[];
//   onConfirm: (selected: { [date: string]: string[] }) => void;
//   onClose: () => void;
// }

// interface Category {
//   _id: string;
//   title: string;
// }

// export default function ModalCategorySelector({ dates, onConfirm, onClose }: ModalCategorySelectorProps) {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<{ [date: string]: string[] }>({});

//   useEffect(() => {
//     async function fetchCategories() {
//       const data = await client.fetch<Category[]>(`*[_type == "blogCategory" && i18n_lang == "en"]{_id, title}`);
//       setCategories(data);
//     }
//     fetchCategories();
//   }, []);

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const handleChange = (date: string, selectedOptions: any) => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const selectedIds = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
//     setSelectedCategories(prev => ({ ...prev, [date]: selectedIds }));
//   };

//    const handleConfirm = () => {
//     const missingDates = dates
//       .map(d => d.toISOString().split('T')[0])
//       .filter(dateKey => {
//         const arr = selectedCategories[dateKey];
//         return !arr || arr.length === 0;
//       });

//     if (missingDates.length > 0) {
//       const msg = `Please select at least one category for each date. Missing: ${missingDates.join(', ')}`;
//       alert(msg);
//       return;
//     }

//     console.log('selectedCategories: ', selectedCategories);
//     onConfirm(selectedCategories);
//     onClose();
//   };


//   return ReactDOM.createPortal(
//     <div className="modal-overlay">
//       <div className="modal">
//         <h2>Select Categories for Each Article</h2>
//         <div className="modal__list">
//           {dates.map(dateObj => {
//             const dateKey = dateObj.toISOString().split('T')[0];
//             return (
//               <div key={dateKey} className="modal__item">
//                 <p className="modal__date">{dateKey}</p>
//                 <Select
//                   isMulti
//                   options={categories.map(cat => ({ value: cat._id, label: cat.title }))}
//                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                   onChange={(selected: any) => handleChange(dateKey, selected)}
//                 />
//               </div>
//             );
//           })}
//         </div>
//         <div className="modal__actions">
//           <button onClick={handleConfirm} className="btn btn-primary">Confirm</button>
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// }

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
  const [errors, setErrors] = useState<{ [date: string]: boolean }>({});

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
    if (selectedIds.length > 0) {
      setErrors(prev => ({ ...prev, [date]: false }));
    }
  };

  const handleConfirm = () => {
    const newErrors: { [date: string]: boolean } = {};
    const missingDates = dates
      .map(d => d.toISOString().split('T')[0])
      .filter(dateKey => {
        const arr = selectedCategories[dateKey];
        if (!arr || arr.length === 0) {
          newErrors[dateKey] = true;
          return true;
        }
        return false;
      });

    if (missingDates.length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('selectedCategories: ', selectedCategories);
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
            const hasError = errors[dateKey];
            return (
              <div key={dateKey} className="modal__item">
                <p className={`modal__date ${hasError ? 'error-text' : ''}`}>Article on {dateKey}</p>
                <Select
                  isMulti
                  options={categories.map(cat => ({ value: cat._id, label: cat.title }))}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(selected: any) => handleChange(dateKey, selected)}
                  classNamePrefix={hasError ? 'select-error' : ''}
                  placeholder={hasError ? 'Category/s not selected' : 'Select category/s'}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: hasError ? 'red' : base.borderColor,
                      boxShadow: hasError ? '0 0 0 1px red' : base.boxShadow
                    })
                  }}
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
