
import { Button } from "../ui/button";
import { UserIcon } from "lucide-react";

export function AuthButton() {
  function loginWithReplit() {
    window.addEventListener("message", authComplete);
    const h = 500;
    const w = 350;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;

    const authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + location.host,
      "_blank",
      `modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
    );

    function authComplete(e: MessageEvent) {
      if (e.data !== "auth_complete") return;
      window.removeEventListener("message", authComplete);
      authWindow?.close();
      location.reload();
    }
  }

  return (
    <Button onClick={loginWithReplit} variant="ghost">
      <UserIcon className="mr-2 h-4 w-4" />
      Replit로 로그인
    </Button>
  );
}
