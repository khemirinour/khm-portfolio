/**
 * macOS desktop wallpaper behind the VS Code window: a calm night sky
 * with small twinkling stars. Purely decorative and non-interactive.
 */
export function NightSky() {
  return (
    <div aria-hidden className="desktop-night pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="star-field star-field-far absolute inset-[-20%]" />
      <div className="star-field star-field-near absolute inset-[-20%]" />
      <div className="moon-glow absolute right-[12%] top-[10%] size-40 rounded-full md:size-56" />
      <div className="horizon-haze absolute inset-x-0 bottom-0 h-1/3" />
    </div>
  );
}
