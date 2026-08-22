type MenuItem = {
  title: string;
};
type SidebarProps = {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  memberCount: number;
};
const menus: MenuItem[] = [
  { title: "회원권 관리" },
  { title: "일시승계" },
  { title: "이력" },
];

export default function Sidebar({
  activeMenu,
  onMenuChange,
  memberCount,
}: SidebarProps) {

  return (
    <aside className="w-72 min-h-screen bg-[#171717] text-white border-r border-neutral-800">
      <div className="p-8">

        <h2 className="text-xs tracking-[5px] text-[#C9A86A]">
          THE PRIVY HOUSE
        </h2>

        <div className="mt-12 space-y-2">
      {menus.map((menu) => (
  <button
    key={menu.title}
    onClick={() => onMenuChange(menu.title)}
    className={`w-full rounded-xl px-4 py-3 text-left transition ${
      activeMenu === menu.title
        ? "bg-[#651A1A] text-white"
        : "text-white hover:bg-white/10"
    }`}
  >
    {menu.title}
  </button>
))}
        </div>

        <div className="mt-20 rounded-xl border border-[#C9A86A]/30 bg-[#651A1A]/20 p-4">
          <p className="text-xs text-[#C9A86A]">
            Membership Rights
          </p>

          <p className="mt-2 text-3xl font-light">
            {memberCount}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            Total Active Rights
          </p>
        </div>

      </div>
    </aside>
  );
}