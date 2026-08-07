"use client";

import React from 'react';
import { Pencil } from 'lucide-react';

interface CustomEditButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const CustomEditButton: React.FC<CustomEditButtonProps> = ({ onClick, disabled }) => {
  return (
    <button className="custom-edit-button" onClick={onClick} disabled={disabled}>
      <Pencil className="custom-button-svg-icon" />
    </button>
  );
};

export default CustomEditButton;