
import ActivityList from '@/components/ActivityList';

const ActivityPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Aktiviteter</h1>
        <ActivityList />
      </div>
    </div>
  );
};

export default ActivityPage;
