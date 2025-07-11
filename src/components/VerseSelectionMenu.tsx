import React from "react";

interface VerseSelectionMenuProps {
  isHighlighted: boolean;
  onHighlight: (color: string) => void;
  onRemoveHighlight: () => void;
  onCopy: () => void;
  onShowSelected: () => void;
  onClose: () => void;
}

const VerseSelectionMenu: React.FC<VerseSelectionMenuProps> = ({
  isHighlighted,
  onHighlight,
  onRemoveHighlight,
  onCopy,
  onShowSelected,
  onClose,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2">
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onHighlight("bg-red-200")}
          className="p-2 rounded-full bg-red-200"
        />
        <button
          onClick={() => onHighlight("bg-green-200")}
          className="p-2 rounded-full bg-green-200"
        />
        <button
          onClick={() => onHighlight("bg-blue-200")}
          className="p-2 rounded-full bg-blue-200"
        />
      </div>
      {isHighlighted && (
        <button
          onClick={onRemoveHighlight}
          className="w-full text-left p-2 mt-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Remove Highlight
        </button>
      )}
      <button
        onClick={onCopy}
        className="w-full text-left p-2 mt-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Copy Verse
      </button>
      <button
        onClick={onShowSelected}
        className="w-full text-left p-2 mt-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Show Selected Verses
      </button>
      <button
        onClick={onClose}
        className="w-full text-left p-2 mt-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Close
      </button>
    </div>
  );
};

export default VerseSelectionMenu;