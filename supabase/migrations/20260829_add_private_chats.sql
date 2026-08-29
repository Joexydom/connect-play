-- PRIVATE CONVERSATIONS
CREATE TABLE public.private_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id uuid NOT NULL,
  user_2_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Ensure consistent ordering of users
  CONSTRAINT no_self_conversation CHECK (user_1_id < user_2_id),
  UNIQUE(user_1_id, user_2_id)
);
CREATE INDEX private_conversations_user_1_idx ON public.private_conversations (user_1_id);
CREATE INDEX private_conversations_user_2_idx ON public.private_conversations (user_2_id);

GRANT SELECT, INSERT ON public.private_conversations TO authenticated;
GRANT ALL ON public.private_conversations TO service_role;
ALTER TABLE public.private_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON public.private_conversations 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);
CREATE POLICY "Users can create conversations" ON public.private_conversations 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- PRIVATE MESSAGES
CREATE TABLE public.private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX private_messages_conversation_created_idx ON public.private_messages (conversation_id, created_at);
CREATE INDEX private_messages_sender_idx ON public.private_messages (sender_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_messages TO authenticated;
GRANT ALL ON public.private_messages TO service_role;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read messages from their conversations" ON public.private_messages 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.private_conversations c 
      WHERE c.id = conversation_id 
      AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
    )
  );
CREATE POLICY "Users can insert messages to their conversations" ON public.private_messages 
  FOR INSERT TO authenticated 
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.private_conversations c 
      WHERE c.id = conversation_id 
      AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
    )
  );
CREATE POLICY "Users can update their own messages" ON public.private_messages 
  FOR UPDATE TO authenticated 
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can delete their own messages" ON public.private_messages 
  FOR DELETE TO authenticated 
  USING (sender_id = auth.uid());

-- Trigger for updated_at on private_messages
CREATE TRIGGER update_private_messages_updated_at BEFORE UPDATE ON public.private_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on private_conversations  
CREATE TRIGGER update_private_conversations_updated_at BEFORE UPDATE ON public.private_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify other participant on new private message
CREATE OR REPLACE FUNCTION public.notify_private_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
  recipient_id uuid;
BEGIN
  SELECT COALESCE(display_name, username, 'Someone') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  
  -- Determine which user is the recipient
  SELECT CASE 
    WHEN user_1_id = NEW.sender_id THEN user_2_id 
    ELSE user_1_id 
  END INTO recipient_id
  FROM public.private_conversations WHERE id = NEW.conversation_id;

  -- Create notification for recipient
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (
    recipient_id,
    'private_message',
    COALESCE(sender_name, 'Someone') || ' sent you a message',
    left(NEW.content, 140),
    '/app?tab=chats'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER private_messages_notify AFTER INSERT ON public.private_messages FOR EACH ROW EXECUTE FUNCTION public.notify_private_message();
