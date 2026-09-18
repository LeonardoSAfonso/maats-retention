import { Suspense } from "react";
import { SubscriptionDashboard } from "@/components/subscription/subscription-dashboard";
import { SubscriptionSkeleton } from "@/components/subscription/subscription-skeleton";
import { getSubscriptions } from "@/lib/api";

async function SubscriptionsContent() {
  const data = await getSubscriptions();

  return <SubscriptionDashboard items={data.subscriptions} />;
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <section aria-labelledby="subscriptions-heading">
        <h1 id="subscriptions-heading" className="sr-only">
          Autoatendimento e Gestão de Assinaturas
        </h1>

        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionsContent />
        </Suspense>
      </section>
    </main>
  );
}
