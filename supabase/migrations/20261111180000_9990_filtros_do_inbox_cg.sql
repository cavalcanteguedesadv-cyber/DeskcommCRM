-- manifest: **Filtros do Inbox do escritório (fork Cavalcante & Guedes):** campos calculados `primeira_mensagem_em(conversations)` (régua de "Chegaram no mês", pela data real da primeira mensagem) e `cliente_falou_por_ultimo(conversations)` (a última mensagem é do cliente). Invoker, revogadas de public/anon. Aditiva: só `create or replace` de função.
-- Dois campos calculados para os filtros do Inbox do escritório (fork Cavalcante & Guedes).
--
-- (1) `primeira_mensagem_em(conversations)`: o instante da PRIMEIRA mensagem da
--     conversa. É a régua do filtro "Chegaram no mês". Não usa `contacts.created_at`
--     nem `conversations.created_at` de propósito: conversa trazida do histórico do
--     WhatsApp nasce no dia da importação, e as duas colunas diriam que o cliente de
--     ano passado "chegou este mês". A mensagem guarda a data real (`sent_at`).
--     Servida por `idx_messages_conversation_sent` (um `min()` por conversa).
-- (2) `cliente_falou_por_ultimo(conversations)`: a última mensagem da conversa é do
--     cliente, lida ou não. Comparação entre duas colunas da mesma linha, que o
--     PostgREST não sabe pedir como filtro, por isso vira campo calculado.
--
-- Invoker (não definer): só leem a própria linha e `messages` da mesma organização,
-- sob a RLS de quem pergunta. Revogadas de `public` e de `anon` (as duas origens do
-- EXECUTE), concedidas só a quem a rota usa. Aditiva e idempotente.
create or replace function public.primeira_mensagem_em(public.conversations)
returns timestamptz
language sql
stable
set search_path = public
as $primeira$
  select min(m.sent_at)
    from public.messages m
   where m.conversation_id = $1.id
     and m.organization_id = $1.organization_id;
$primeira$;

comment on function public.primeira_mensagem_em(public.conversations)
  is 'Campo calculado (fork Cavalcante & Guedes): instante da primeira mensagem da conversa. Régua do filtro "Chegaram no mês" do Inbox (?primeira_mensagem_em=gte.<início do mês>).';

revoke execute on function public.primeira_mensagem_em(public.conversations) from public, anon;
grant  execute on function public.primeira_mensagem_em(public.conversations) to authenticated, service_role;

create or replace function public.cliente_falou_por_ultimo(public.conversations)
returns boolean
language sql
immutable
set search_path = public
as $ultimo$
  select $1.last_inbound_at is not null
     and ($1.last_outbound_at is null or $1.last_inbound_at > $1.last_outbound_at);
$ultimo$;

comment on function public.cliente_falou_por_ultimo(public.conversations)
  is 'Campo calculado (fork Cavalcante & Guedes): a última mensagem da conversa é do cliente, lida ou não. Régua do filtro "Cliente falou por último" do Inbox (?cliente_falou_por_ultimo=is.true).';

revoke execute on function public.cliente_falou_por_ultimo(public.conversations) from public, anon;
grant  execute on function public.cliente_falou_por_ultimo(public.conversations) to authenticated, service_role;

notify pgrst, 'reload schema';
