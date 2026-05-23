# VivaRota 🗺️

**Aplicativo mobile de navegação segura para pedestres em São Paulo.**

Permite que usuários reportem incidentes em tempo real (assaltos, falta de iluminação, áreas isoladas) e recebam rotas que desviam dessas áreas de risco. Similar ao Waze, mas focado na segurança do pedestre.

---

## 📱 Testar o App (Android)

> **[⬇️ Download do APK](https://expo.dev/accounts/leo.work2077/projects/VivaRota-App/builds/09362ffd-e24c-4e7b-ac59-e2c27c654218)**

> ⚠️ **Importante:** O link do APK só funciona se você estiver **deslogado do Expo** ou abrindo em uma **aba anônima** do navegador.

1. Acesse o link acima em aba anônima
2. Baixe e instale o APK no Android
3. Abra o app — backend e banco já estão em produção, não precisa configurar nada

---

## 🔗 Repositório

**GitHub:** [https://github.com/K4u4z/VivaRota](https://github.com/K4u4z/VivaRota)

| Branch | Conteúdo |
|--------|----------|
| `main` / `develop` | Frontend React Native |
| `Versão1` | Backend Spring Boot |
| `feature/mapa-rotas` | Mapa, rotas e integração com API |
| `feature/login-cadastro` | Login, cadastro e onboarding |
| `feature/perfil-usuario` | Tela inicial e perfil do usuário |
| `feature/notificacoes` | Reportar incidentes, SOS e notificações |

---

## 🛠️ Stack de Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React Native + Expo (Development Build) |
| Mapa | Mapbox (`@rnmapbox/maps`) |
| Backend | Spring Boot v4.0.5 (Java 17) |
| Banco de Dados | PostgreSQL 17 + PostGIS 3.6 |
| ORM | Hibernate + Hibernate Spatial |
| Autenticação | JWT |
| Build | EAS (Expo Application Services) |
| Hospedagem Backend | Railway |
| Hospedagem Banco | Supabase |

---

## 👥 Time

| Membro | Branch | Responsabilidade |
|--------|--------|-----------------|
| Leo | `feature/mapa-rotas` | Mapa e Rotas |
| Kauã | `feature/mapa-rotas` | Mapa e Rotas |
| Kelvin Vargas | `feature/login-cadastro` | Login, Cadastro e Onboarding |
| Matheus Marinho | `feature/perfil-usuario` | Tela inicial e Perfil do usuário |
| Nicolas | `feature/notificacoes` | Reportar incidentes, Notificações e SOS |

---

## 🚀 Funcionalidades Implementadas

### Mapa e Rotas (`feature/mapa-rotas`) ✅
- Mapa Mapbox com localização do usuário em tempo real
- Busca de endereço com autocomplete (Mapbox Geocoding API)
- Cálculo de rota para pedestre (walking)
- **Marcadores de incidentes reais** do banco aparecendo no mapa
- Cores por tipo: ASSALTO=vermelho, ASSÉDIO=vinho, SEM_ILUMINAÇÃO=laranja, ÁREA_ISOLADA=roxo, ACIDENTE=azul, OUTROS=cinza
- Algoritmo de rota segura com score de perigo baseado em incidentes próximos (raio 700m)
- Fator temporal: incidentes recentes pesam mais no cálculo de perigo
- Níveis de segurança: **Seguro** (0), **Atenção** (≤3), **Moderado** (≤7), **Perigoso** (>7)
- Polling automático a cada 30 segundos para novos incidentes

### Login e Cadastro (`feature/login-cadastro`) ✅
- Slides de onboarding com swipe
- Tela de boas-vindas
- Formulário de login e cadastro com validação
- Armazenamento seguro do JWT com `expo-secure-store`

### Perfil do Usuário (`feature/perfil-usuario`) ✅
- Card de perfil com avatar, reputação e estatísticas
- Conquistas do usuário

### Notificações e SOS (`feature/notificacoes`) ✅
- Grid de tipos de incidente com GPS automático
- Detalhe de alerta com botões "Confirmar" e "Já passou"
- Cadastro de até 5 contatos de emergência
- Botão SOS com contagem regressiva 3s, animação ripple e vibração
- Lista de notificações

---

## 🗄️ Banco de Dados

**PostgreSQL 17 + PostGIS 3.6** hospedado no Supabase.

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Dados dos usuários com geolocalização (PostGIS) |
| `incidentes` | Ocorrências reportadas com tipo, coordenadas e expiração |
| `rotas` | Histórico de rotas calculadas |
| `contatos_emergencia` | Contatos de emergência por usuário |
| `acionamentos_sos` | Registros de acionamento do botão SOS |
| `tipo_incidente_peso` | Pesos dos tipos de incidente para cálculo de perigo |

### Recursos Especiais
- **Trigger PostGIS** — preenche automaticamente a coluna `localizacao` a partir de latitude/longitude
- **Function `calcular_perigo_rota`** — calcula score de perigo ao longo de uma rota com fator temporal (última hora=100%, últimas 6h=70%, últimas 12h=40%, mais antigos=20%)

---

## 🔌 API Backend

**Base URL (produção):** `https://vivarota-production.up.railway.app`

**Swagger:** `https://vivarota-production.up.railway.app/swagger-ui/index.html`

### Endpoints Principais

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/login` | Público | Login, retorna JWT |
| POST | `/auth/cadastrar` | Público | Cadastro de usuário |
| GET | `/incidentes` | Público | Lista todos os incidentes |
| GET | `/incidentes/proximos?lat=&lng=&raio=` | Público | Incidentes num raio (metros) |
| POST | `/incidentes` | JWT | Reportar novo incidente |
| PATCH | `/incidentes/{id}/confirmar` | Público | Confirmar alerta |
| POST | `/rotas/calcular` | JWT | Calcular rota segura e rápida com score de perigo |
| GET | `/usuarios/{id}` | JWT | Dados do usuário |

---

## 💻 Rodar Localmente (para devs do time)

### Pré-requisitos
- Node.js 18+
- App VivaRota instalado no celular Android (APK acima)

### Frontend

```bash
# Clone o repositório
git clone https://github.com/K4u4z/VivaRota.git
cd VivaRota

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
# O .env.example já vem com a URL do Railway e o token Mapbox preenchidos
# Não precisa alterar nada!

# Instale dependências
npm install

# Inicie o Expo
npx expo start
# Pressione 's' para development build
# Escaneie o QR code com o app VivaRota instalado no celular
```

> ✅ O backend já está rodando no Railway — não precisa subir nada localmente!

### Backend (opcional — só se quiser rodar local)

```bash
# Entre na branch do backend
git checkout Versão1
cd VivaRota

# Configure src/main/resources/application.properties com suas credenciais
# Inicie o backend
./mvnw spring-boot:run
# API disponível em http://localhost:8080
```

---

## 📐 Arquitetura

```
VivaRota/
├── VivaRota/                  ← Backend Spring Boot (branch Versão1)
│   └── src/main/java/.../
│       ├── config/            ← SecurityConfig, SecurityFilter, CORS
│       ├── controller/        ← Auth, Incidente, Rota, Usuario
│       ├── services/          ← Lógica de negócio + integração Mapbox
│       ├── entities/          ← Entidades JPA com PostGIS
│       └── repository/        ← Spring Data JPA
│
└── VivaRota-App/              ← Frontend React Native (branch main)
    ├── app/                   ← Telas (Expo Router)
    ├── components/            ← MarkerIncidente, RotaMapa, BuscaDestino
    ├── hooks/                 ← useRota, useIncidentes
    └── services/              ← api.ts, alertas.ts, mapbox.ts
```

---

## 📄 Licença

Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento Mobile — SENAC São Paulo, 2026.
