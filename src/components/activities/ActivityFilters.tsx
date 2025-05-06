
import { Button } from "@/components/ui/button";

interface ActivityFiltersProps {
  activeSection: 'common' | 'personal';
  setActiveSection: (section: 'common' | 'personal') => void;
}

const ActivityFilters = ({ activeSection, setActiveSection }: ActivityFiltersProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button 
        variant={activeSection === 'common' ? "default" : "outline"}
        onClick={() => setActiveSection('common')}
        className="flex-1"
      >
        Gemensamma
      </Button>
      <Button 
        variant={activeSection === 'personal' ? "default" : "outline"}
        onClick={() => setActiveSection('personal')}
        className="flex-1"
      >
        Personliga
      </Button>
    </div>
  );
};

export default ActivityFilters;
