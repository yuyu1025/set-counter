import { LocaleProvider } from "@/components/LocaleProvider";
import { SetCounter } from "@/components/SetCounter";

export default function Home() {
  return (
    <LocaleProvider>
      <SetCounter />
    </LocaleProvider>
  );
}
