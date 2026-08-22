export default function Header() {
  return (
    <header className="border-b bg-[#651A1A] text-white">
      <div className="flex items-center justify-between px-10 py-6">

        <div>
          <h1 className="text-4xl tracking-[8px] font-light">
            THE PRIVY HOUSE
          </h1>

          <p className="mt-2 text-sm tracking-[4px] text-[#D8BF85]">
            Membership Rights Management System
          </p>
        </div>

        <div className="flex items-center gap-6">

          <input
            placeholder="회원명 · 호실 · 회원권번호 검색"
            className="w-96 rounded-xl border border-[#8C5B5B] bg-[#7A2020] px-5 py-3 outline-none placeholder:text-[#E3D4B2]"
          />

          <div className="text-right">
            <p className="text-xs text-[#D8BF85]">
              MEMBER RELATIONS
            </p>

            <h2 className="text-2xl font-light">
              한규진 Manager
            </h2>
          </div>

        </div>

      </div>
    </header>
  );
}