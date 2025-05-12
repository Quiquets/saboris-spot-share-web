
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search by name or username",
  fullWidth = true
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isMobile ? "Search..." : placeholder}
        className="pl-10 pr-4 w-full"
      />
    </div>
  );
};

export default SearchInput;
