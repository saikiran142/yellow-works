import clsx from "clsx";

interface Props {
  className?: string;
  /**
   * "responsive": wordmark from 400px up, the mark alone below that (phones).
   * "wide": always the full horizontal logo. "mark": always the mark.
   */
  mode?: "responsive" | "wide" | "mark";
}

/**
 * Official logo files from /public/brand. Dark-theme and light-theme variants are both rendered and
 * swapped with CSS (see .logo-* in globals.css), so there is no flash on theme change. The light
 * variants use the brand's deeper signal green, as the brand rules require on light backgrounds.
 */
export function Logo({ className, mode = "responsive" }: Props): React.JSX.Element {
  const wide = mode !== "mark";
  const mark = mode !== "wide";
  return (
    <span className={clsx("logo", mode === "responsive" && "logo-responsive", className)}>
      {wide && (
        <span className="logo-wide">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG needs no optimisation */}
          <img className="logo-d h-7 w-auto" src="/brand/logo-horizontal-dark.svg" alt="The Yellow Works" width={546} height={100} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-l h-7 w-auto" src="/brand/logo-horizontal-light.svg" alt="The Yellow Works" width={546} height={100} />
        </span>
      )}
      {mark && (
        <span className="logo-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-d h-9 w-auto" src="/brand/mark-dark.svg" alt="The Yellow Works" width={100} height={100} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-l h-9 w-auto" src="/brand/mark-light.svg" alt="The Yellow Works" width={100} height={100} />
        </span>
      )}
    </span>
  );
}
