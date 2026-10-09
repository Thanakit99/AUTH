import { signIn, signOut } from "@/auth";

type AuthButtonsProps = {
  isLoggedIn: boolean;
  userName?: string | null;
};

export function AuthButtons({ isLoggedIn, userName }: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border-2 border-stone-300 shadow-sm">
        <span className="text-sm font-medium text-stone-700">
          🌱 สวัสดี, <strong className="text-stone-900">{userName ?? "ผู้ใช้งาน"}</strong>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button 
            type="submit" 
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[0_3px_0_#000000] active:translate-y-1 active:shadow-[0_1px_0_#000000] transition-all cursor-pointer text-sm"
          >
            🚪 ออกจากระบบ
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button 
        type="submit" 
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl border-2 border-black shadow-[0_4px_0_#000000] active:translate-y-1 active:shadow-[0_1px_0_#000000] transition-all cursor-pointer text-sm"
      >
        <span className="bg-white text-blue-600 p-1 rounded-md text-xs font-extrabold flex items-center justify-center shadow-inner">
          G
        </span> 
        🔑 เข้าสู่ระบบด้วย Google
      </button>
    </form>
  );
}