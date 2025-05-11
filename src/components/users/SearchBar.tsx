
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = "Search by name or username" }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4"
      />
    </div>
  );
};

export default SearchBar;
