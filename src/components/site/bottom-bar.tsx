import { ButtonLink } from "@/components/ui/button";
import { dict } from "@/content/i18n";

/** Mobile-only sticky action bar. WhatsApp number comes from env; placeholder until confirmed. */
export function BottomBar({ whatsappHref }: { whatsappHref: string }): React.JSX.Element {
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-40 flex gap-3 rounded-t-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
      <ButtonLink variant="secondary" href={whatsappHref} className="flex-1">
        {dict.cta.whatsapp}
      </ButtonLink>
      <ButtonLink href="/book-a-demo" className="flex-1">
        {dict.cta.bookDemo}
      </ButtonLink>
    </div>
  );
}
