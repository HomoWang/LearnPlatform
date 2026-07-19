type MascotVariant = "happy" | "curious" | "write" | "cheer" | "sleep";

type MascotProps = {
  /** happy＝揮手微笑；curious＝圓眼歪頭（空狀態）；write＝寫筆記；cheer＝慶祝；sleep＝睡覺 */
  variant?: MascotVariant;
  width?: number;
};

const files: Record<MascotVariant, string> = {
  happy: "mascot-wave.png",
  curious: "mascot-curious.png",
  write: "mascot-write.png",
  cheer: "mascot-cheer.png",
  sleep: "mascot-sleep.png"
};

/** 平台吉祥物「墨墨」——插畫資產位於 public/art/（規格見 claude_data/design/codex-illustration-spec.md）。 */
export default function Mascot({ variant = "happy", width = 120 }: MascotProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}art/${files[variant]}`}
      width={width}
      height={width}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="select-none"
    />
  );
}
