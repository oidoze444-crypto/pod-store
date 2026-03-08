import React, { useState } from 'react';
import { FileText, Database, Server, Globe, CheckCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';

const files = [
  {
    id: 'readme',
    label: 'README — Guia Completo',
    icon: FileText,
    color: 'bg-blue-100 text-blue-700',
    description: 'Passo a passo completo de migração',
    path: 'components/migration/README.txt',
  },
  {
    id: 'schema',
    label: 'schema.sql',
    icon: Database,
    color: 'bg-purple-100 text-purple-700',
    description: 'Execute no MySQL do Hostinger',
    path: 'components/migration/schema.sql.txt',
  },
  {
    id: 'server',
    label: 'server.js — Backend Node.js',
    icon: Server,
    color: 'bg-green-100 text-green-700',
    description: 'API REST completa (Express + MySQL)',
    path: 'components/migration/backend_server.js.txt',
  },
  {
    id: 'api',
    label: 'api.js — Frontend API',
    icon: Globe,
    color: 'bg-orange-100 text-orange-700',
    description: 'Substitui o mysqlApi.js (sem Base44)',
    path: 'components/migration/frontend_api.js.txt',
  },
  {
    id: 'login',
    label: 'Login.jsx — Página de Login',
    icon: FileText,
    color: 'bg-red-100 text-red-700',
    description: 'Autenticação própria com JWT',
    path: 'components/migration/login_page.jsx.txt',
  },
  {
    id: 'router',
    label: 'App.jsx — Roteamento',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-700',
    description: 'App completo sem dependência do Base44',
    path: 'components/migration/app_router.jsx.txt',
  },
  {
    id: 'env',
    label: '.env — Variáveis de Ambiente',
    icon: FileText,
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Configurações do backend',
    path: 'components/migration/env_example.txt',
  },
  {
    id: 'pkg',
    label: 'package.json + vite.config',
    icon: FileText,
    color: 'bg-gray-100 text-gray-700',
    description: 'Dependências e configuração de build',
    path: 'components/migration/package_json.txt',
  },
];

const steps = [
  { num: 1, title: 'Banco de Dados', desc: 'Execute o schema.sql no phpMyAdmin do Hostinger (as tabelas já existem, IF NOT EXISTS não duplica)', color: 'bg-purple-600' },
  { num: 2, title: 'Backend no Vercel', desc: 'Crie conta em vercel.com, faça deploy do server.js com as variáveis de ambiente. É gratuito.', color: 'bg-green-600' },
  { num: 3, title: 'Ajustar Frontend', desc: 'Substitua mysqlApi.js por api.js, troque os imports, adicione Login.jsx e App.jsx novo', color: 'bg-blue-600' },
  { num: 4, title: 'Build + Upload', desc: 'npm run build → gera /dist → sobe no File Manager do Hostinger. Crie o .htaccess para React Router.', color: 'bg-orange-600' },
];

export default function MigrationGuide() {
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const htaccess = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-gray-900 text-white py-8 px-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">📦 Guia de Migração</h1>
          <p className="text-gray-400 text-sm">Base44 → Hostinger + Vercel (independente)</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-8">

        {/* Steps */}
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-4">Passo a Passo</h2>
          <div className="space-y-3">
            {steps.map(step => (
              <div key={step.num} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4 items-start">
                <div className={`${step.color} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Files */}
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-4">Arquivos Gerados</h2>
          <p className="text-sm text-gray-500 mb-4">
            Todos os arquivos estão em <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">components/migration/</code> no projeto Base44.
            Copie cada um clicando no botão abaixo.
          </p>
          <div className="space-y-3">
            {files.map(file => {
              const Icon = file.icon;
              return (
                <div key={file.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className={`p-2 rounded-xl ${file.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-900">{file.label}</h3>
                      <p className="text-xs text-gray-500">{file.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg font-mono hidden sm:block">{file.path}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* .htaccess */}
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">⚠️ Arquivo .htaccess (obrigatório)</h2>
          <p className="text-sm text-gray-500 mb-3">
            Crie este arquivo na raiz do <code className="bg-gray-100 px-1 rounded text-xs">public_html</code> do Hostinger após o upload do build. Sem ele, as rotas do React não funcionam.
          </p>
          <div className="bg-gray-900 rounded-2xl p-4 relative">
            <pre className="text-green-400 text-xs overflow-x-auto">{htaccess}</pre>
            <button
              onClick={() => copyText(htaccess, 'htaccess')}
              className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied === 'htaccess' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'htaccess' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <h2 className="font-bold text-emerald-900 mb-3">📊 Resumo do que muda</h2>
          <div className="space-y-2 text-sm">
            {[
              ['base44.functions.invoke(\'mysqlQuery\')', 'fetch(\'/api/...\')'],
              ['base44.auth.me()', 'JWT via localStorage'],
              ['base44.functions.invoke(\'uploadToHostinger\')', 'fetch(\'/api/upload\')'],
              ['createPageUrl(\'AdminProducts\')', '\'/admin/products\''],
              ['Layout.js Base44', 'BrowserRouter + Routes'],
            ].map(([from, to], i) => (
              <div key={i} className="flex gap-2 items-start bg-white rounded-xl p-3">
                <span className="font-mono text-xs text-red-600 flex-1 break-all">{from}</span>
                <span className="text-gray-400 flex-shrink-0">→</span>
                <span className="font-mono text-xs text-green-700 flex-1 break-all">{to}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center text-sm text-gray-400 pb-4">
          Tempo estimado total: ~1h30 de trabalho técnico
        </div>
      </div>
    </div>
  );
}