import { ConversationThread } from "@/components/messages/ConversationThread";

export default async function StudioConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConversationThread conversationId={id} role="studio" />;
}
