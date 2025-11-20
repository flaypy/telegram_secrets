// app/[locale]/page.tsx  (ou app/page.tsx se estiver usando rota dinâmica de locale)
import { redirect } from 'next/navigation';

export default async function HomePage({
                                         params,
                                       }: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // redireciona para /{locale}/store
  redirect(`/${locale}/store`);
}
