
interface EmptyActivitiesProps {
  isPersonal: boolean;
  hasCategories: boolean;
  hasError?: boolean;
}

const EmptyActivities = ({ isPersonal, hasCategories, hasError }: EmptyActivitiesProps) => {
  if (hasError) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="mb-2">Det gick inte att hämta aktiviteter. Kontrollera din internetanslutning.</p>
        <p>Försök igen senare eller kontakta support om problemet kvarstår.</p>
      </div>
    );
  }
  
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
