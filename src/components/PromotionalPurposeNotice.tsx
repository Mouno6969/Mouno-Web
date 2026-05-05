import { promotionalPurpose, site } from "@/lib/constants";

type PromotionalPurposeNoticeProps = {
  className?: string;
  compact?: boolean;
};

export function PromotionalPurposeNotice({ className = "", compact = false }: PromotionalPurposeNoticeProps) {
  return (
    <section className={`purposeNotice${compact ? " compact" : ""}${className ? ` ${className}` : ""}`} aria-label="Promotional purpose notice">
      <div>
        <span>{promotionalPurpose.label}</span>
        <strong>{promotionalPurpose.title}</strong>
        <p>{promotionalPurpose.statement}</p>
      </div>
      <a className="purposeNoticeLink" href={site.publicUrl} target="_blank" rel="noreferrer">
        {promotionalPurpose.officialCta}
      </a>
    </section>
  );
}
