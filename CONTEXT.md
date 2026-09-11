# Teste de Código - Vaga Dev Sr (Claro / Experimentações)

Cenário do teste: **Cancelamento com Retenção Inteligente**. Avalia fullstack senior via um fluxo de auto-atendimento (assinatura) com camada de IA que reduz o custo de retenção humana.

## Linguagem

**Assinante**:
Pessoa titular de uma assinatura recorrente que pode iniciar um cancelamento.
_Evitar_: Cliente, usuário, conta

**Plano**:
Tipo contratado de uma assinatura, definindo benefícios, valor recorrente e ciclo de cobrança.
_Evitar_: Pacote, tier

**Assinatura**:
Contrato recorrente vigente entre assinante e provedor, com plano, valor e histórico de uso.
_Evitar_: Plano (reservar para o tipo contratado), conta

**Cancelamento**:
Solicitação formal de encerramento de assinatura iniciada pelo assinante via auto-atendimento.
_Evitar_: Churn (reservar para o fenômeno agregado), desligamento

**Churn**:
Perda agregada de assinantes em um período, medida como taxa. O sistema existe para reduzir essa taxa.
_Evitar_: Cancelamento (este é o evento individual), perda

**Agente de Scoring**:
Componente que atribui um risco de churn (0.00–1.00) a um cancelamento em andamento, a partir de dados do assinante e da assinatura.
_Evitar_: Agente de risco, modelo (reservar para o modelo de LLM por trás do agente)

**Agente de Classificação**:
Componente que classifica o motivo do cancelamento em categorias canônicas (ex.: preço, falta de uso, problema técnico, concorrência).
_Evitar_: Agente de categorização, tagger

**Oferta de Retenção**:
Ação oferecida ao assinante para evitar o churn (ex.: desconto, upgrade, pausa), selecionada a partir do risco e do motivo.
_Evitar_: Promoção, benefício, cupom

**Evento de Engajamento**:
Interação registrada do assinante com o serviço (ex.: login, playback) usada como entrada pelo Agente de Scoring.
_Evitar_: Atividade, evento (reservar para evento de domínio genérico)

**Evento de Pagamento**:
Registro de cobrança recorrente (em dia, atrasado, falhou) usado como entrada complementar pelo Agente de Scoring.
_Evitar_: Cobrança, fatura

**Zona Cinzenta**:
Faixa intermediária do risco de churn (ex.: 0.30–0.70) em que a decisão entre oferta automática e retenção humana não é determinística; requer desempate humano ou regra secundária.
_Evitar_: Caso ambíguo, limiar (reservar para threshold de implementação)

**Retenção Humana**:
Encaminhamento do cancelamento a um especialista humano quando o agente de scoring retorna zona cinzenta, ou alto risco em assinatura de alto valor recorrente. Equivale ao "back-office" cujo custo se busca reduzir.
_Evitar_: Back-office (usar o termo do domínio), suporte

**Custo Evitado**:
Métrica da PoC: redução de gastos com retenção humana, calculada como (casos que iriam para retenção humana antes do sistema) − (casos que vão para retenção humana agora), valorados a R$ 15 por caso.
_Evitar_: Economia, redução de custo (reservar para o conceito genérico)
