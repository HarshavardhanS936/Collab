import { useState } from 'react';

export default function SkillTagInput({ value, onChange, placeholder, error, className = '' }) {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !value.includes(newSkill)) {
        onChange([...value, newSkill]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(value.filter(s => s !== skillToRemove));
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 p-2 border rounded-md shadow-sm transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-white ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}>
      {value.map(skill => (
        <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-primary">
          {skill}
          <button
            type="button"
            onClick={() => handleRemoveSkill(skill)}
            className="ml-1.5 text-primary hover:text-red-600 focus:outline-none font-bold"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        className="flex-grow border-0 focus:ring-0 px-1 py-1 text-sm bg-transparent outline-none min-w-[120px]"
        placeholder={value.length === 0 ? (placeholder || "Type a skill and press Enter") : "Add another skill..."}
        value={skillInput}
        onChange={(e) => setSkillInput(e.target.value)}
        onKeyDown={handleAddSkill}
      />
    </div>
  );
}
