Expo React Native Node Mobile ATC game using Canvas Engine
Gameplay: Separate Aircraft using vectors, speed, and altitude.

## Leaderboard (Supabase)

1. Copie `.env.example` para `.env`.
2. Preencha:
	- `EXPO_PUBLIC_SUPABASE_URL`
	- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (pode ser `anon` legado JWT ou `sb_publishable_...`)
3. Rode o app com `npm start`.

O jogo usa RPC no Supabase:
- `submit_score` para salvar somente melhor score por jogador/modo.
- `get_leaderboard` para carregar Top 15.

Sem variáveis de ambiente, o app continua com fallback local (localStorage).
Se falhar internet, os scores entram em fila local e são reenviados automaticamente ao reconectar.
