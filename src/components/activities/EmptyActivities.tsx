
interface EmptyActivitiesProps {
  isPersonal: boolean;
  hasCategories: boolean;
}

const EmptyActivities = ({ isPersonal, hasCategories }: EmptyActivitiesProps) => {
  if (!hasCategories) {
    return (
      <div className="text-center p-8 text-gray-500">
        Inga aktiviteter hittades i denna kategori.
      </div>
    );
  }
  
  if (isPersonal) {
    return (
      <div className="text-center p-8 text-gray-500">
        Du har inga personliga aktiviteter än. Kontakta en administratör för att lägga till personliga mål.
      </div>
    );
  }
  
  return null;
};

export default EmptyActivities;
