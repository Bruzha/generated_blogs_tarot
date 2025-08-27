// modalUtils.ts
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ModalCategorySelector from '../app/componets/sections/modalCategorySelector/ModalCategorySelector';

export function selectCategoriesForDates(dates: Date[]): Promise<{ [date: string]: string[] }> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleConfirm = (selected: { [date: string]: string[] }) => {
      resolve(selected);
      root.unmount();
      container.remove();
    };

    const handleClose = () => {
      resolve({});
      root.unmount();
      container.remove();
    };

    root.render(<ModalCategorySelector dates={dates} onConfirm={handleConfirm} onClose={handleClose} />);
  });
}
