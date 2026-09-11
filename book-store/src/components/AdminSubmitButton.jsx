import React from 'react';
import { HiRefresh } from 'react-icons/hi';

const AdminSubmitButton = ({ children, loading, className = '', ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    aria-busy={loading}
    className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-60`}
  >
    {loading && <HiRefresh className="h-4 w-4 animate-spin" aria-hidden="true" />}
    {loading ? 'Saving...' : children}
  </button>
);

export default AdminSubmitButton;
