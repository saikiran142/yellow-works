/** Decorative aurora mesh + film grain. Hidden from assistive tech. */
export function Ambient(): React.JSX.Element {
  return (
    <div aria-hidden="true">
      <div className="aurora" />
      <div className="grain" />
    </div>
  );
}
