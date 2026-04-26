# VivaRota — Contexto do Projeto para Claude Code

## O que é o VivaRota?
Aplicativo mobile de navegação segura para pedestres, similar ao Uber mas focado em segurança urbana. Permite que usuários reportem incidentes em tempo real (assaltos, falta de iluminação, áreas isoladas) e recebam rotas que desviam dessas áreas de risco.

## Status
MVP em desenvolvimento.

---

## Time e Responsabilidades

| Membro | Responsabilidade |
|---|---|
| Kelvin Vargas | Tela de Login e Cadastro |
| Matheus Marinho | Tela inicial (splash) com logo e Tela de Perfil do usuário |
| Leo | Implementação do Mapa e função de Rotas |
| Kauã | Implementação do Mapa e função de Rotas |
| Nicolas | Notificações e Reports de Incidentes (assalto, falta de iluminação, etc.) |

---

## Stack de Tecnologias

- **Frontend:** React Native + Expo
- **Backend:** Spring Boot v4.0.5 (Java 17)
- **Banco de Dados:** PostgreSQL 17 + PostGIS 3.6
- **ORM:** Hibernate com Hibernate Spatial
- **Autenticação:** JWT (`api.security.token.secret`)
- **API:** REST — porta `8080`

---

## Configuração do Banco de Dados

- **Nome do banco:** `vivarota_db`
- **Host:** `localhost:5432`
- **Usuário:** `postgres`
- **Senha:** `123Admin`
- **Extensão obrigatória:** PostGIS (geolocalização)

### Tabelas criadas automaticamente pelo Hibernate

| Tabela | Descrição |
|---|---|
| `usuarios` | Dados dos usuários, reputação, localização |
| `incidentes` | Reportes de incidentes com geolocalização (PostGIS) |
| `rotas` | Rotas calculadas com origem/destino |
| `contatos_emergencia` | Contatos cadastrados para o botão de pânico |
| `acionamentos_sos` | Histórico de acionamentos do botão de emergência |

---

## Telas do MVP

1. **Onboarding / Boas-vindas** — Apresenta o app em 2 ou 3 telas para novos usuários
2. **Cadastro e Login** — Criação de conta e autenticação (Kelvin)
3. **Mapa Principal** — Tela central com mapa, localização do usuário e alertas ativos (Leo)
4. **Definir Destino e Ver Rota** — Rota mais segura desviando de alertas, com comparativo da rota normal (Leo)
5. **Reportar Incidente** — Seleção do tipo de ocorrência com captura automática de GPS (Nicolas)
6. **Detalhe do Alerta** — Card com tipo, tempo do reporte e botões "Confirmar" / "Já passou" (Nicolas)
7. **Botão de Emergência** — Fixo e acessível em qualquer tela, envia localização ao segurar 3 segundos (Nicolas)
8. **Contatos de Emergência** — Cadastro dos contatos que recebem o alerta de pânico (Nicolas)
9. **Perfil do Usuário** — Nome, pontuação de reputação e histórico de reportes (Matheus)

---

## Validação de Mercado (Pesquisa com Usuários)

Pesquisa realizada com pedestres urbanos confirmou a viabilidade do produto:

- Maioria dos respondentes já se sentiu insegura durante deslocamentos a pé
- Principal vulnerabilidade: período noturno, ruas desertas e sem iluminação
- Alta intenção de uso de um app com rotas seguras e alertas em tempo real
- Critérios de confiança nos alertas: confirmação por múltiplos usuários, alertas recentes e reputação de quem reportou
- Disposição de pagamento: entre R$ 6,00 e R$ 20,00/mês
- Aceitação de versão gratuita com anúncios também confirmada

---

## Problema e Solução

**Problema:** Falta de informação sobre trajetos seguros em áreas de risco para pedestres.

**Solução:** Sistema que utiliza dados de ocorrências de assaltos reportados pelos próprios usuários para analisar o nível de risco das regiões. A partir do ponto de partida e destino informados, o sistema calcula rotas que priorizam áreas com menor incidência de crimes.

**Como medir:**
- Simulações de rotas em horários críticos
- Comparação com sistemas tradicionais
- Formulários de percepção de risco
- Análise de aderência da trajetória
- Taxa de assertividade
- Perfis confiáveis
- Teste de usabilidade
- Validações cruzadas com dados oficiais

---

## Padrões do Projeto

- O backend segue arquitetura REST com Spring Boot
- Entidades usam UUID como ID (exceto `usuarios` que usa integer com identity)
- Geolocalização de incidentes usa o tipo `geography(Point, 4326)` do PostGIS
- Autenticação via JWT com chave configurável por variável de ambiente `JWT_SECRET`
- Upload de imagens limitado a 2MB

---

## Como Rodar Localmente

### Backend (Spring Boot)
1. Ter PostgreSQL 17 instalado e rodando
2. Criar o banco `vivarota_db`
3. Habilitar a extensão PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;`
4. Criar o usuário postgres: `CREATE USER postgres WITH PASSWORD '123Admin' SUPERUSER;`
5. Configurar o `application.properties` com as credenciais acima
6. Rodar com `./mvnw spring-boot:run`
7. API disponível em `http://localhost:8080`

### Frontend (React Native)
> Documentação a ser adicionada pelo time de front.
