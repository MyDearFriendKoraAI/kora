# Supabase Storage Setup per Avatars

## 1. Creare il Bucket 'avatars'

Nel dashboard di Supabase:

1. Vai su **Storage** nel menu laterale
2. Clicca **"New bucket"**
3. Nome bucket: `avatars`
4. Seleziona **"Public bucket"** ✅
5. Clicca **"Save"**

## 2. Configurare le Policies (RLS)

Nel bucket `avatars`, vai su **Policies** e crea le seguenti regole:

### Policy 1: SELECT (lettura pubblica)
```sql
CREATE POLICY "Public Avatar Access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Policy 2: INSERT (upload per utenti autenticati)
```sql
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 3: UPDATE (aggiornamento per proprietari)
```sql
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy 4: DELETE (eliminazione per proprietari)
```sql
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Struttura File

I file verranno organizzati come:
```
avatars/
├── {userId}/
│   ├── {timestamp}-avatar.jpg
│   ├── {timestamp}-avatar.png
│   └── {timestamp}-avatar.webp
```

## 4. Configurazioni Aggiuntive

### Limiti File
- **Dimensione massima**: 5MB per file
- **Formati supportati**: JPG, PNG, WebP
- **Auto-eliminazione**: Vecchi avatar vengono eliminati automaticamente

### Performance
- **Cache Control**: 3600 secondi (1 ora)
- **CDN**: Automatico con Supabase
- **Compressione**: Gestita dal browser

## 5. Test della Configurazione

Per verificare che tutto funzioni:

1. Vai su `/profile` nell'app
2. Carica un'immagine di test
3. Verifica che l'avatar appaia nella navbar
4. Controlla che il vecchio avatar sia stato eliminato

## 6. Troubleshooting

### Errore "Access Denied"
- Verifica che le policies siano attive
- Controlla che il bucket sia pubblico
- Assicurati che l'utente sia autenticato

### Upload Fallisce
- Verifica dimensione file (max 5MB)
- Controlla formato file (JPG/PNG/WebP)
- Verifica connessione a Supabase

### URL Non Funziona
- Controlla che il bucket sia pubblico
- Verifica la struttura del path
- Testa l'URL direttamente nel browser