
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Health Squads</h1>
      <p className="text-xl text-gray-600 mb-8">Välkommen till Health Squads! Utmana dig själv och dina vänner till en hälsosammare livsstil.</p>
      
      <div className="space-y-4">
        <Button 
          size="lg" 
          onClick={() => navigate('/auth')}
          className="px-8"
        >
          Logga in
        </Button>
        
        <p className="text-sm text-gray-500">
          Inte medlem än? <Button variant="link" className="p-0" onClick={() => navigate('/auth')}>Registrera dig</Button>
        </p>
      </div>
    </div>
  );
};

export default Index;
