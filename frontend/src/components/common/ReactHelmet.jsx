import { useEffect } from 'react';

export const ReactHelmet = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} | Inventory AI` : 'Inventory Management System';

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }
  }, [title, description]);

  return null;
};
