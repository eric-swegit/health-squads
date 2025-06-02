
export const calculateStreaks = (activities: { date: string }[]) => {
  if (!activities || activities.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sortera aktiviteter efter datum (senaste först)
  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Få unika datum
  const uniqueDates = [...new Set(sortedActivities.map(activity => activity.date))];
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
  
  // Beräkna nuvarande streak
  let currentStreak = 0;
  const hasActivityToday = uniqueDates.includes(today);
  const hasActivityYesterday = uniqueDates.includes(yesterday);
  
  if (hasActivityToday) {
    currentStreak = 1;
    // Kolla bakåt från igår
    let checkDate = yesterday;
    let consecutiveDays = true;
    
    while (consecutiveDays) {
      if (uniqueDates.includes(checkDate)) {
        currentStreak++;
        const nextDate = new Date(checkDate);
        nextDate.setDate(nextDate.getDate() - 1);
        checkDate = nextDate.toISOString().split('T')[0];
      } else {
        consecutiveDays = false;
      }
    }
  } else if (hasActivityYesterday) {
    currentStreak = 1;
    // Kolla bakåt från i förrgår
    let checkDate = new Date(yesterday);
    checkDate.setDate(checkDate.getDate() - 1);
    let dateStr = checkDate.toISOString().split('T')[0];
    let consecutiveDays = true;
    
    while (consecutiveDays) {
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        dateStr = checkDate.toISOString().split('T')[0];
      } else {
        consecutiveDays = false;
      }
    }
  }
  
  // Beräkna längsta streak
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Sortera datum i kronologisk ordning för att hitta längsta streak
  const chronologicalDates = uniqueDates.sort();
  
  for (let i = 0; i < chronologicalDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(chronologicalDates[i]);
      const previousDate = new Date(chronologicalDates[i - 1]);
      const dayDifference = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDifference === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
};
