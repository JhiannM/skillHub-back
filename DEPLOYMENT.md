# Despliegue Backend - SkillHub

## Plataforma sugerida

Render o Railway con Node.js 20 y PostgreSQL administrado.

## Variables de entorno

Configura estas variables en el servicio del backend:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-frontend.vercel.app
DATABASE_URL=postgresql://usuario:password@host:5432/base_de_datos
DB_SSL=true
JWT_SECRET=usa_una_clave_larga_y_segura
JWT_EXPIRES_IN=24h
```

Si no usas `DATABASE_URL`, puedes configurar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.

## Render

1. Crea una base de datos PostgreSQL.
2. Crea un Web Service conectado a `https://github.com/JhiannM/skillHub-back`.
3. Usa estos comandos:
   - Build command: `npm ci`
   - Start command: `npm start`
4. Copia la URL publica del frontend en `CORS_ORIGIN`.
5. Crea un Deploy Hook y guardalo en GitHub como `RENDER_DEPLOY_HOOK_URL`.

## GitHub Actions

El workflow `.github/workflows/deploy.yml` ejecuta `npm ci`, `npm run lint` y luego dispara el deploy hook de Render cuando hay cambios en `main`.
