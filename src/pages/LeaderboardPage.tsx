
import { useState } from 'react';
import Leaderboard from '@/components/Leaderboard';

const LeaderboardPage = () => {
  const [pageTitle] = useState('Leaderboard');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">{pageTitle}</h1>
        <Leaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage;
