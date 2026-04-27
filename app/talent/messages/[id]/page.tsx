import { ConversationThread } from "@/components/messages/ConversationThread";

export default async function TalentConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConversationThread conversationId={id} role="talent" />;
}
