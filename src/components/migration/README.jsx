============================================================
GUIA DE MIGRAÇÃO — POD STORE (Base44 → Hostinger)
============================================================

ARQUIVOS GERADOS:
─────────────────
1. schema.sql.txt        → Execute no MySQL do Hostinger
2. backend_server.js.txt → Servidor Node.js (API REST completa)
3. env_example.txt       → Variáveis de ambiente do backend
4. frontend_api.js.txt   → Substituto do mysqlApi.js (sem Base44)
5. login_page.jsx.txt    → Página de login própria
6. app_router.jsx.txt    → App.jsx com rotas sem Base44
7. package_json.txt      → package.json do backend + configs Vite
8. README.txt            → Este arquivo

============================================================
PASSO A PASSO DE MIGRAÇÃO
============================================================

ETAPA 1 — BANCO DE DADOS
────────────────────────
1. Acesse o phpMyAdmin no Hostinger
2. Abra o banco de dados existente
3. Execute o conteúdo de schema.sql.txt
   (as tabelas já existem, então o CREATE IF NOT EXISTS não vai duplicar)

ETAPA 2 — BACKEND (Node.js)
────────────────────────────
Opção A: Hospedar no Hostinger Business/Cloud (suporta Node.js)
  1. Crie a pasta do projeto no servidor
  2. Cole o conteúdo de backend_server.js.txt como server.js
  3. Crie o .env com base em env_example.txt
  4. Rode: npm install && node server.js

Opção B: Hospedar no Vercel (GRATUITO — recomendado)
  1. Crie conta em vercel.com
  2. Crie novo projeto Node.js
  3. Cole o server.js
  4. Configure as env vars no painel do Vercel
  5. Vercel vai gerar uma URL tipo: https://seu-projeto.vercel.app

Opção C: Hospedar no Railway (GRATUITO)
  1. Crie conta em railway.app
  2. Deploy com GitHub ou upload direto

ETAPA 3 — FRONTEND (React)
───────────────────────────
1. Clone o projeto ou copie todos os arquivos .jsx/.js das pastas:
   - pages/
   - components/store/
   - components/admin/

2. Substitua components/mysqlApi.js pelo conteúdo de frontend_api.js.txt
   (salve como src/api/api.js)

3. Troque nos imports de todas as páginas:
   DE:   import { productsApi } from '../components/mysqlApi'
   PARA: import { productsApi } from '../api/api'

4. Substitua App.jsx pelo conteúdo de app_router.jsx.txt

5. Adicione pages/Login.jsx com o conteúdo de login_page.jsx.txt

6. Troque os uploads nas páginas Admin:
   DE:   base44.functions.invoke('uploadToHostinger', form)
   PARA: uploadFile(file) (importar de '../api/api')

7. Crie o .env na raiz do frontend:
   VITE_API_URL=https://sua-api.vercel.app/api

8. Para build final:
   npm install
   npm run build
   → gera pasta /dist pronta para subir no Hostinger File Manager

ETAPA 4 — DEPLOY DO FRONTEND NO HOSTINGER
──────────────────────────────────────────
1. Rode npm run build → gera pasta /dist
2. Acesse Hostinger → File Manager → public_html
3. Apague os arquivos antigos
4. Faça upload do conteúdo da pasta /dist

5. Crie o arquivo .htaccess no public_html:
─────────────────────────────────────────────
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
─────────────────────────────────────────────
(Necessário para o React Router funcionar corretamente)

============================================================
RESUMO DO QUE MUDA NO CÓDIGO
============================================================

| O QUE ERA (Base44)                     | O QUE VIRA                     |
|----------------------------------------|--------------------------------|
| base44.functions.invoke('mysqlQuery')  | fetch('/api/...')              |
| base44.auth.me()                       | JWT via localStorage           |
| base44.functions.invoke('upload...')   | fetch('/api/upload')           |
| createPageUrl('AdminProducts')         | '/admin/products'              |
| Layout.js (Base44)                     | BrowserRouter + Routes         |

============================================================
ESTIMATIVA DE TEMPO
============================================================
- Configurar MySQL: 10 min (tabelas já existem)
- Subir backend no Vercel: 20 min
- Ajustar imports do frontend: 30 min
- Build + upload Hostinger: 15 min
Total: ~1h30 de trabalho técnico

============================================================