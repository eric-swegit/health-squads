

## Plan: Glömt lösenord-funktion

### Oversikt
Lägga till "Glömt lösenord?" i inloggningsformuläret och en separat sida `/reset-password` där användaren kan sätta nytt lösenord efter att ha klickat på länken i mejlet.

### Steg

**1. Uppdatera Auth.tsx**
- Lägga till state `showForgotPassword` för att visa/gömma formuläret
- Lägga till en "Glömt lösenord?"-länk under login-formuläret
- När man klickar visas ett e-postfält + knapp som anropar `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Visa bekräftelsemeddelande via toast
- Knapp för att gå tillbaka till inloggning

**2. Skapa ny sida ResetPassword.tsx**
- Route: `/reset-password`
- Kontrollerar URL-hash för `type=recovery`
- Visar formulär med nytt lösenord + bekräfta lösenord
- Anropar `supabase.auth.updateUser({ password })` för att uppdatera lösenordet
- Redirectar till `/` efter lyckad uppdatering

**3. Uppdatera App.tsx**
- Lägga till publik route `/reset-password` som renderar `ResetPassword`-sidan (utanför PrivateRoute)

### Tekniska detaljer
- Supabase hanterar mejlutskick för lösenordsåterställning automatiskt
- `redirectTo` sätts till appens URL + `/reset-password` så användaren hamnar rätt
- `/reset-password` måste vara en publik route (inte skyddad av auth)

