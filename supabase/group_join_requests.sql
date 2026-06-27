-- Tabela de pedidos de entrada e convites para grupos
CREATE TABLE IF NOT EXISTS group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'request', -- 'request' = usuário pediu; 'invite' = dono convidou
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

-- Usuário vê seus próprios pedidos/convites; dono vê pedidos do grupo dele
CREATE POLICY "view_own_or_owned_group" ON group_join_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- Usuário pode criar pedido pra si; dono pode criar convite para outros
CREATE POLICY "insert_request_or_invite" ON group_join_requests
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
  );

-- Dono aceita/rejeita pedidos; usuário aceita/rejeita convites
CREATE POLICY "update_by_owner_or_user" ON group_join_requests
  FOR UPDATE USING (
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid())
    OR user_id = auth.uid()
  );
