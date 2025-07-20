# Password Reset - Guida Test

## Flusso Completo di Test

### 1. Richiesta Reset Password
1. Vai su http://localhost:3001/forgot-password
2. Inserisci una email valida registrata in Supabase
3. Clicca "Invia link di recupero"
4. Verifica che appaia il messaggio di successo

### 2. Email di Reset
1. Controlla la casella email (e spam) dell'indirizzo inserito
2. Clicca sul link nell'email di Supabase
3. Verifica che venga reindirizzato a `/reset-password` con parametri token

### 3. Reset Password
1. La pagina `/reset-password` dovrebbe:
   - Verificare automaticamente la validità del token
   - Mostrare il form se il token è valido
   - Mostrare errore se il token è scaduto/invalido
2. Inserisci una nuova password (min 8 caratteri, 1 maiuscola, 1 numero)
3. Conferma la password
4. Verifica il password strength indicator
5. Clicca "Aggiorna Password"

### 4. Verifica Successo
1. Dovrebbe apparire animazione di successo
2. Redirect automatico a `/login` dopo 2 secondi
3. Toast "Password aggiornata con successo!"

### 5. Test Login
1. Prova il login con la nuova password
2. Verifica che l'accesso funzioni correttamente

## Scenari di Errore da Testare

### Token Scaduto
- Usa un link più vecchio di 24 ore
- Dovrebbe mostrare messaggio di errore e link per nuovo reset

### Token Già Usato
- Usa lo stesso link due volte
- Dovrebbe mostrare errore "Link non valido"

### Password Debole
- Prova password con meno di 8 caratteri
- Prova password senza maiuscole o numeri
- Dovrebbe bloccare l'invio e mostrare errori

### Password Identica
- Usa la stessa password attuale
- Dovrebbe mostrare errore "password deve essere diversa"

## Security Features Implementate

✅ Token one-time use (gestito da Supabase)
✅ Token expiration (24 ore)
✅ Password strength validation
✅ Redirect immediato dopo uso
✅ Gestione errori specifici in italiano
✅ Auto-focus e UX ottimizzata
✅ Loading states e animazioni