import { notFound } from "next/navigation";
import { getChannel } from "@/lib/manifest";
import Studio from "@/components/Studio";
import AgeGate from "@/components/AgeGate";

export const dynamic = "force-dynamic";

export default async function ChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ch = await getChannel(id);
  if (!ch) notFound();
  const studio = <Studio id={ch.id} name={ch.name} tagline={ch.tagline} adult={ch.adult} system={ch.system} />;
  return ch.adult ? <AgeGate>{studio}</AgeGate> : studio;
}
