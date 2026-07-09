# Sistema do Conselho — Ala Providência (Fase 1)

Sistema de gestão para os líderes do conselho da Ala Providência (Estaca Cidade Nova).

## O que está incluído na Fase 1
- Login com e-mail e senha (Supabase Auth)
- Perfis de acesso: admin, bispado, secretário, presidência
- Dashboard com resumo e aniversariantes do mês
- Módulo de Membros: listagem, busca, filtros, cadastro, edição, arquivamento e exportação em PDF
- Módulo de Famílias: cadastro, chefe da família, acompanhamento prioritário

## Como rodar (StackBlitz ou local)

1. **Crie o projeto no Supabase** (https://supabase.com — plano gratuito):
   - No SQL Editor, execute o arquivo `fase1-schema-supabase.sql` (fornecido separadamente).
   - Em Authentication > Users, crie o primeiro usuário (e-mail + senha).
   - No SQL Editor, vincule esse usuário como admin:
     ```sql
     insert into usuarios (auth_user_id, nome_exibicao, perfil)
     values ('<uuid do usuário em Authentication>', 'Seu Nome', 'admin');
     ```

2. **Configure as variáveis de ambiente**:
   - Copie `.env.example` para `.env` e preencha com a URL e a anon key do projeto
     (Settings > API no painel do Supabase).

3. **Instale e rode**:
   ```bash
   npm install
   npm run dev
   ```
   No StackBlitz: importe a pasta do projeto e ele instala e roda automaticamente.

## Estrutura
```
src/
  lib/supabase.js      cliente do Supabase
  lib/pdf.js           exportação da lista de membros em PDF
  context/AuthContext  sessão + perfil do usuário logado
  components/Layout    cabeçalho, navegação e identidade do usuário
  pages/               Login, Dashboard, Membros, MembroForm, Familias, FamiliaForm
```

## Privacidade (LGPD)
Os dados armazenados incluem dados pessoais sensíveis (convicção religiosa).
As permissões são aplicadas no banco via Row Level Security. O PDF exportado
inclui aviso de uso interno. Não compartilhe as credenciais do Supabase.
