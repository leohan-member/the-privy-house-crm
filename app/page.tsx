"use client";

import { useEffect, useMemo, useState } from "react";
import AssignmentDrawer from "./components/AssignmentDrawer";
import Sidebar from "./components/Sidebar";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";
type Status = "OWNER" | "TEMPORARY" | "HOLD";

type Membership = {
  unit: string;
  membershipNo: string;
  owner: string;
  ownerPhone: string;
  companyName?: string;
  occupation?: string;
  memo?: string;
  currentUser: string;
  currentUserPhone: string;
  memberType?: "개인" | "법인";
  status: Status;
  contractType: string;
  startDate: string;
  endDate: string;
  assignmentStart?: string;
  assignmentEnd?: string;
  updatedBy?: string;
updatedAt?: string;
};

const initialMembers: Membership[] = [
  {
    unit: "3601",
    membershipNo: "TPH-3601",
    owner: "홍길동",
    ownerPhone: "010-1234-5678",
    currentUser: "홍길동",
    currentUserPhone: "010-1234-5678",
    status: "OWNER",
    contractType: "자가사용",
    startDate: "2026.06.20",
    endDate: "2028.06.19",
  },
  {
    unit: "3602",
    membershipNo: "TPH-3602",
    owner: "김영희",
    ownerPhone: "010-2222-3333",
    currentUser: "이민수",
    currentUserPhone: "010-4444-5555",
    status: "TEMPORARY",
    contractType: "임대",
    startDate: "2026.06.20",
    endDate: "2028.06.19",
    assignmentStart: "2026.08.01",
    assignmentEnd: "2027.07.31",
  },
  {
    unit: "3603",
    membershipNo: "TPH-3603",
    owner: "박정우",
    ownerPhone: "010-5555-6666",
    currentUser: "HOLD",
    currentUserPhone: "-",
    status: "HOLD",
    contractType: "단기임대",
    startDate: "2026.06.20",
    endDate: "2028.06.19",
  },
];

const statusLabel = {
  OWNER: "소유자 사용",
  TEMPORARY: "일시승계",
  HOLD: "HOLD",
};

const statusStyle = {
  OWNER: "bg-green-50 text-green-700",
  TEMPORARY: "bg-amber-50 text-amber-700",
  HOLD: "bg-gray-100 text-gray-600",
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
const [authLoading, setAuthLoading] = useState(true);
const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);
    setAuthLoading(false);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, newSession) => {
  setSession(newSession);

  if (event === "PASSWORD_RECOVERY") {
    setIsPasswordRecovery(true);
  }

  setAuthLoading(false);
});

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const [members, setMembers] = useState<Membership[]>(initialMembers);
  const [membersLoaded, setMembersLoaded] = useState(false);
  async function saveHistoryToSupabase(item: {
  date: string;
  unit: string;
  action: string;
  detail: string;
}) {
  const { error } = await supabase
    .from("History")
    .insert({
      date: item.date,
      unit: item.unit,
      action: item.action,
      detail: item.detail,
    });

  if (error) {
    console.error("History Supabase 저장 실패:", error);
  }
}
useEffect(() => {
    if (!session) return;
  async function loadMembers() {
    const { data, error } = await supabase
      .from("Member")
      .select("*")
      .order("unit", { ascending: true });

    if (error) {
      console.error("회원 데이터 불러오기 실패:", error);
      setMembersLoaded(true);
      return;
    }

    console.log("SUPABASE 회원:", data);

    setMembers(
      (data ?? []).map((row) => ({
        unit: row.unit ?? "",
        membershipNo: row.membership_no ?? "",
        owner: row.owner ?? "",
        ownerPhone: row.owner_phone ?? "",
        companyName: row.company_name ?? "",
        occupation: row.occupation ?? "",
        memo: row.memo ?? "",
        currentUser: row.current_user ?? "",
        currentUserPhone: row.current_user_phone ?? "",
        memberType: row.member_type ?? "",
        status: row.status ?? "OWNER",
        contractType: row.contract_type ?? "",
        startDate: row.start_date ?? "",
        endDate: row.end_date ?? "",
        assignmentStart: row.assignment_start ?? "",
        assignmentEnd: row.assignment_end ?? "",
        updatedBy: row.updated_by ?? "",
updatedAt: row.updated_at ?? "",
      }))
    );

    setMembersLoaded(true);
  }

  loadMembers();
}, [session]);
useEffect(() => {
  async function testSupabase() {
    const { data, error } = await supabase
      .from("Member")
      .select("*");

    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);
  }

  testSupabase();
}, []);
useEffect(() => {
  if (!membersLoaded) return;

  localStorage.setItem(
    "tph_members",
    JSON.stringify(members)
  );
}, [members, membersLoaded]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [floorFilter, setFloorFilter] = useState("ALL");
  const [selected, setSelected] = useState<Membership | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<number[]>([]);
  const [editingHistoryId, setEditingHistoryId] = useState<number | null>(null);
const [editingHistoryText, setEditingHistoryText] = useState("");
  const [history, setHistory] = useState<
  {
    id: number;
    date: string;
    unit: string;
    action: string;
    detail: string;
    requester?: string;
handler?: string;
category?: string;
note?: string;
  }[]
>([]);
const [historyLoaded, setHistoryLoaded] = useState(false);

useEffect(() => {
  const savedHistory = localStorage.getItem("tph_membership_history");

  if (savedHistory) {
    try {
      setHistory(JSON.parse(savedHistory));
    } catch {
      setHistory([]);
    }
  }

  setHistoryLoaded(true);
}, []);

useEffect(() => {
  if (!historyLoaded) return;

  localStorage.setItem(
    "tph_membership_history",
    JSON.stringify(history)
  );
}, [history, historyLoaded]);
useEffect(() => {
  if (!membersLoaded) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredMembers = members.filter((member) => {
    if (member.status !== "TEMPORARY" || !member.assignmentEnd) {
      return false;
    }

    const end = new Date(
      member.assignmentEnd.replace(/\./g, "-")
    );
    end.setHours(0, 0, 0, 0);

    return !isNaN(end.getTime()) && end < today;
  });

  if (expiredMembers.length === 0) return;

  setMembers((prev) =>
    prev.map((member) => {
      const expired = expiredMembers.some(
        (item) => item.membershipNo === member.membershipNo
      );

      if (!expired) return member;

      return {
        ...member,
        currentUser: member.owner,
        currentUserPhone: member.ownerPhone,
        status: "OWNER",
        assignmentStart: undefined,
        assignmentEnd: undefined,
      };
    })
  );
void Promise.all(
  expiredMembers.map((member) =>
    supabase
      .from("Member")
      .update({
        current_user: member.owner,
        current_user_phone: member.ownerPhone,
        status: "OWNER",
        assignment_start: null,
        assignment_end: null,
      })
      .eq("membership_no", member.membershipNo)
  )
).then((results) => {
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    console.error("자동 일시승계 종료 Supabase 저장 실패:", failed.error);
  }
});
  setHistory((prev) => {
    const newHistory = expiredMembers.filter(
      (member) =>
        !prev.some(
          (item) =>
            item.unit === member.unit &&
            item.action === "일시승계 종료 · 소유자 복귀"
        )
    );

    if (newHistory.length === 0) return prev;

    const historyItems = newHistory.map((member) => ({
  id: Date.now() + Math.random(),
  date: new Date().toISOString().slice(0, 10),
  unit: member.unit,
  action: "일시승계 종료 · 소유자 복귀",
  detail: `${member.membershipNo} 일시승계 종료 후 소유자 ${member.owner}에게 회원권 복귀`,
}));

historyItems.forEach(({ date, unit, action, detail }) => {
  void saveHistoryToSupabase({
    date,
    unit,
    action,
    detail,
  });
});

return [...prev, ...historyItems];

  });
}, [members, membersLoaded]);
const [activeMenu, setActiveMenu] = useState("회원권 관리");
  const [showRegister, setShowRegister] = useState(false);
  const [showBulkRegister, setShowBulkRegister] = useState(false);
  const [bulkText, setBulkText] = useState("");
const [showEdit, setShowEdit] = useState(false);
const [historySearch, setHistorySearch] = useState("");
const [historyCategory, setHistoryCategory] = useState("ALL");
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;

    if (showLog) {
      setShowLog(false);
      return;
    }

    if (showAssignment) {
      setShowAssignment(false);
      return;
    }

    if (showEdit) {
      setShowEdit(false);
      return;
    }

    if (selected) {
      setSelected(null);
      return;
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, [showLog, showAssignment, showEdit, selected]);

  const [form, setForm] = useState({
    unit: "",
    membershipNo: "",
    owner: "",
    ownerPhone: "",
    companyName: "",
    occupation: "",
    memo: "",
    currentUser: "",
    currentUserPhone: "",
    memberType: "개인" as "개인" | "법인",
    contractType: "자가사용",
    startDate: "",
    endDate: "",
    assignmentStart: "",
    assignmentEnd: "",
  });

  const filteredMembers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

 return members
  .filter((member) => {
    const matchesSearch =
      !keyword ||
      member.unit.toLowerCase().includes(keyword) ||
      member.membershipNo.toLowerCase().includes(keyword) ||
      member.owner.toLowerCase().includes(keyword) ||
      member.currentUser.toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "ALL" || member.status === filter;

    const matchesFloor =
      floorFilter === "ALL" ||
      Math.floor(Number(member.unit) / 100) === Number(floorFilter);

    return matchesSearch && matchesFilter && matchesFloor;
  })
  .sort((a, b) => Number(a.unit) - Number(b.unit));
 }, [members, search, filter, floorFilter]);
 const filteredHistory = useMemo(() => {
  const keyword = historySearch.trim().toLowerCase();

  return history.filter((item) => {
    const matchesSearch =
      !keyword ||
      item.unit.toLowerCase().includes(keyword) ||
      item.action.toLowerCase().includes(keyword) ||
      item.detail.toLowerCase().includes(keyword) ||
      (item.requester ?? "").toLowerCase().includes(keyword) ||
      (item.handler ?? "").toLowerCase().includes(keyword);

    const matchesCategory =
      historyCategory === "ALL" ||
      item.category === historyCategory;

    return matchesSearch && matchesCategory;
  });
}, [history, historySearch, historyCategory]);

async function registerBulkMembers() {
  if (!bulkText.trim()) {
    alert("등록할 회원정보를 입력해주세요.");
    return;
  }

  const lines = bulkText
    .trim()
    .split("\n")
    .map((line) => line.split("\t"));

  const newMembers: Membership[] = [];

  for (const row of lines) {
    if (row.length < 9) {
      alert("입력 형식이 올바르지 않습니다.\n각 회원은 11개 항목이어야 합니다.");
      return;
    }

    const [
      unit,
      membershipNo,
      owner,
      ownerPhone,
      currentUser,
      currentUserPhone,
      contractType,
      startDate,
      endDate,
      assignmentStart,
      assignmentEnd,
    ] = row.map((value) => value.trim());

    if (!unit || !membershipNo || !owner || !ownerPhone) {
      alert("호실, 회원권번호, 소유자, 소유자 연락처는 필수입니다.");
      return;
    }

    if (members.some((member) => member.unit === unit)) {
      alert(`${unit}호는 이미 등록된 회원입니다.`);
      return;
    }

    if (members.some((member) => member.membershipNo === membershipNo)) {
      alert(`${membershipNo}는 이미 등록된 회원권 번호입니다.`);
      return;
    }

    const isOwner = contractType === "자가사용";

    newMembers.push({
      unit,
      membershipNo,
      owner,
      ownerPhone,
      currentUser: isOwner ? owner : currentUser,
      currentUserPhone: isOwner ? ownerPhone : currentUserPhone,
      status: isOwner ? "OWNER" : "TEMPORARY",
      contractType,
      startDate,
      endDate,
      assignmentStart: isOwner ? undefined : assignmentStart,
      assignmentEnd: isOwner ? undefined : assignmentEnd,
    });
  }
const bulkRows = newMembers.map((member) => ({
  unit: member.unit,
  membership_no: member.membershipNo,
  owner: member.owner,
  owner_phone: member.ownerPhone,
  company_name: member.companyName || null,
  occupation: member.occupation || null,
  memo: member.memo || null,
  current_user: member.currentUser,
  current_user_phone: member.currentUserPhone,
  member_type: member.memberType,
  status: member.status,
  contract_type: member.contractType,
  start_date: member.startDate,
  end_date: member.endDate,
  assignment_start: member.assignmentStart || null,
  assignment_end: member.assignmentEnd || null,
}));

const { error: bulkInsertError } = await supabase
  .from("Member")
  .insert(bulkRows);

if (bulkInsertError) {
  console.error("회원 일괄등록 Supabase 저장 실패:", bulkInsertError);
  alert("회원 일괄등록 중 오류가 발생했습니다.");
  return;
}
  setMembers((prev) => [...newMembers, ...prev]);

  setHistory((prev) => [
    ...newMembers.map((member) => ({
      id: Date.now() + Math.random(),
      date: new Date().toISOString().slice(0, 10),
      unit: member.unit,
      action: "회원권 일괄 등록",
      detail: `${member.membershipNo} · ${member.owner}`,
    })),
    ...prev,
  ]);

  setBulkText("");
  setShowBulkRegister(false);

  alert(`${newMembers.length}명의 회원이 등록되었습니다.`);
}
  async function registerMembership() {
    if (
      !form.unit ||
      !form.membershipNo ||
      !form.owner ||
      !form.ownerPhone
    ) {
      alert("호실, 회원권 번호, 소유자, 연락처는 필수입니다.");
      return;
    }
const duplicateUnit = members.some(
  (member) => member.unit === form.unit
);

const duplicateMembershipNo = members.some(
  (member) => member.membershipNo === form.membershipNo
);

if (duplicateUnit) {
  alert(`${form.unit}호는 이미 등록된 회원권입니다.`);
  return;
}

if (duplicateMembershipNo) {
  alert(`${form.membershipNo}는 이미 등록된 회원권 번호입니다.`);
  return;
}
    const newMember: Membership = {
      unit: form.unit,
      membershipNo: form.membershipNo,
      owner: form.owner,
      ownerPhone: form.ownerPhone,
      currentUser:
        form.contractType === "자가사용"
          ? form.owner
          : form.currentUser,
      currentUserPhone:
        form.contractType === "자가사용"
          ? form.ownerPhone
          : form.currentUserPhone,
      status:
        form.contractType === "자가사용"
          ? "OWNER"
          : "TEMPORARY",
      contractType: form.contractType,
startDate: form.startDate,
endDate: form.endDate,
assignmentStart:
  form.contractType === "자가사용" ? undefined : form.startDate,
assignmentEnd:
  form.contractType === "자가사용" ? undefined : form.endDate,
};
const { error: insertError } = await supabase
  .from("Member")
  .insert({
    unit: newMember.unit,
    membership_no: newMember.membershipNo,
    owner: newMember.owner,
    owner_phone: newMember.ownerPhone,
    company_name: newMember.companyName || null,
    occupation: newMember.occupation || null,
    memo: newMember.memo || null,
    current_user: newMember.currentUser,
    current_user_phone: newMember.currentUserPhone,
    member_type: newMember.memberType,
    status: newMember.status,
    contract_type: newMember.contractType,
    start_date: newMember.startDate,
    end_date: newMember.endDate,
    assignment_start: newMember.assignmentStart || null,
    assignment_end: newMember.assignmentEnd || null,
  });

if (insertError) {
  console.error("회원 등록 Supabase 저장 실패:", insertError);
  alert("회원 등록 중 오류가 발생했습니다.");
  return;
}
    setMembers((prev) => [newMember, ...prev]);
const registerHistoryItem = {
  id: Date.now(),
  date: new Date().toISOString().slice(0, 10),
  unit: newMember.unit,
  action: "회원권 등록",
  detail: `${newMember.membershipNo} / ${newMember.owner}`,
};

void saveHistoryToSupabase({
  date: registerHistoryItem.date,
  unit: registerHistoryItem.unit,
  action: registerHistoryItem.action,
  detail: registerHistoryItem.detail,
});

setHistory((prev) => [
  registerHistoryItem,
  ...prev,
]);
    setShowRegister(false);

    setForm({
      unit: "",
      membershipNo: "",
      owner: "",
      ownerPhone: "",
      memo: "",
      currentUser: "",
      currentUserPhone: "",
      memberType: "개인",
      companyName: "",
      occupation: "",
      contractType: "자가사용",
      startDate: "",
      endDate: "",
      assignmentStart: "",
      assignmentEnd: "",
    });
  }
  function getAssignmentStatus(endDate?: string) {
  if (!endDate) return "사용 중";

  const end = new Date(endDate.replace(/\./g, "-"));

  if (isNaN(end.getTime())) return "사용 중";

  const today = new Date();

  const diff = Math.ceil(
    (end.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
console.log("승계 종료일:", endDate, "계산된 종료일:", end, "남은 일수:", diff);
  if (diff < 0) return "종료일 경과";
  if (diff <= 30) return "30일 이내 종료";

  return "사용 중";
}
async function updateMembership() {
  if (!selected) return;
  const duplicateMembershipNo = members.some(
    (member) =>
      member.membershipNo === form.membershipNo &&
      member.membershipNo !== selected.membershipNo
  );

  if (duplicateMembershipNo) {
    alert(`${form.membershipNo}는 이미 등록된 회원권 번호입니다.`);
    return;
  }
  if (
    !form.unit ||
    !form.membershipNo ||
    !form.owner ||
    !form.ownerPhone
  ) {
    alert("호실, 회원권 번호, 소유자, 연락처는 필수입니다.");
    return;
  }

  setMembers((prev) =>
    prev.map((member) =>
      member.membershipNo === selected.membershipNo
        ? {
            ...member,
            unit: form.unit,
            membershipNo: form.membershipNo,
            owner: form.owner,
            memberType: form.memberType,
            companyName: form.companyName || "",
            occupation: form.occupation || "",
            memo: form.memo || "",
            ownerPhone: form.ownerPhone,
            currentUser: form.currentUser,
            currentUserPhone: form.currentUserPhone,
            contractType: form.contractType,
            startDate: form.startDate,
            endDate: form.endDate,
            assignmentStart: form.assignmentStart,
assignmentEnd: form.assignmentEnd,
updatedBy: session?.user?.email || "",
updatedAt: new Date().toISOString(),
          }
        : member
    )
  );
const { error: updateError } = await supabase
  .from("Member")
  .update({
    unit: form.unit,
    membership_no: form.membershipNo,
    owner: form.owner,
    owner_phone: form.ownerPhone,
    company_name: form.companyName || null,
    occupation: form.occupation || null,
    memo: form.memo || null,
    current_user: form.currentUser,
    current_user_phone: form.currentUserPhone,
    member_type: form.memberType,
    contract_type: form.contractType,
    start_date: form.startDate,
    end_date: form.endDate,
    assignment_start: form.assignmentStart || null,
    assignment_end: form.assignmentEnd || null,
  })
  .eq("membership_no", selected.membershipNo);

if (updateError) {
  console.error("회원정보 Supabase 수정 실패:", updateError);
  alert("회원정보 저장 중 오류가 발생했습니다.");
  return;
}
const updateHistoryItem = {
  id: Date.now(),
  date: new Date().toISOString().slice(0, 10),
  unit: form.unit,
  action: "회원정보 수정",
  detail: `${form.membershipNo} / ${form.owner}`,
};

void saveHistoryToSupabase({
  date: updateHistoryItem.date,
  unit: updateHistoryItem.unit,
  action: updateHistoryItem.action,
  detail: updateHistoryItem.detail,
});

setHistory((prev) => [
  updateHistoryItem,
  ...prev,
]);

  setSelected({
    ...selected,
    unit: form.unit,
    membershipNo: form.membershipNo,
    owner: form.owner,
    memberType: form.memberType,
    ownerPhone: form.ownerPhone,
    companyName: form.companyName || "",
    occupation: form.occupation || "",
    memo: form.memo || "",
    currentUser: form.currentUser,
    currentUserPhone: form.currentUserPhone,
    contractType: form.contractType,
    startDate: form.startDate,
    endDate: form.endDate,
  });

  setShowEdit(false);
}

// ↑↑↑ 여기까지 ↑↑↑
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2EB]">
        <div className="text-sm text-gray-500">
          로그인 상태 확인 중...
        </div>
      </div>
    );
  }
if (isPasswordRecovery) {
  return (
    <PasswordResetScreen
      onDone={() => setIsPasswordRecovery(false)}
    />
  );
}
  if (!session) {
    return <LoginScreen />;
  }
  return (

    <main className="min-h-screen bg-[#F5F2EB] text-[#1D1D1D]">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}

<Sidebar
  activeMenu={activeMenu}
  onMenuChange={setActiveMenu}
  memberCount={members.length}
/>

        {/* MAIN */}

        <section className="ml-[255px] min-h-screen flex-1">

          {/* HEADER */}

          <header className="border-b border-[#D9D2C6] bg-[#651A1A] text-white">

            <div className="flex h-[100px] items-center justify-between px-10">

              <div>

                <h1 className="text-[28px] font-light tracking-[8px]">
                  THE PRIVY HOUSE
                </h1>

                <p className="mt-2 text-[10px] tracking-[4px] text-[#D8BF85]">
                  MEMBERSHIP MANAGEMENT SYSTEM
                </p>

              </div>

         <div className="text-right">

  <p className="text-[10px] tracking-[2px] text-[#D8BF85]">
    MEMBER RELATIONS
  </p>

  <p className="mt-1 text-sm">
    {session?.user?.email}
  </p>

  <button
    type="button"
    onClick={async () => {
      await supabase.auth.signOut();
    }}
    className="mt-2 text-[11px] text-[#D8BF85] hover:text-white"
  >
    로그아웃
  </button>

</div>

            </div>

          </header>

          {/* CONTENT */}
{activeMenu === "이력" && (
  <div className="p-10">

    <div className="mb-10">
      <p className="text-[11px] tracking-[4px] text-[#9A835F]">
        이력
      </p>

      <h2 className="mt-2 text-[38px] font-light">
        이력
      </h2>
<div className="mt-6 flex gap-3">
  <input
    value={historySearch}
    onChange={(e) => setHistorySearch(e.target.value)}
    placeholder="호실 · 요청자 · 처리자 · 내용 검색"
    className="w-[420px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
  />

  <select
    value={historyCategory}
    onChange={(e) => setHistoryCategory(e.target.value)}
    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
  >
    <option value="ALL">전체 구분</option>
    <option value="회원 문의">회원 문의</option>
    <option value="회원정보 수정">회원정보 수정</option>
    <option value="일시승계">일시승계</option>
    <option value="승계 종료">승계 종료</option>
    <option value="계약 변경">계약 변경</option>
    <option value="서류 접수">서류 접수</option>
    <option value="연락처 변경">연락처 변경</option>
    <option value="기타">기타</option>
  </select>
</div>
      <p className="mt-2 text-sm text-[#777]">
        회원권 및 이용 권한의 변경 이력을 관리합니다.
      </p>
    </div>
<div className="flex justify-end mb-3">
  <button
    type="button"
   onClick={async () => {
  if (selectedHistoryIds.length === 0) return;

  const { error } = await supabase
    .from("History")
    .delete()
    .in("id", selectedHistoryIds);

  if (error) {
    console.error("이력 삭제 실패:", error);
    alert("이력 삭제에 실패했습니다.");
    return;
  }

  setHistory((prev) =>
    prev.filter((item) => !selectedHistoryIds.includes(item.id))
  );

  setSelectedHistoryIds([]);
}}
    className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
  >
    선택 이력 삭제
  </button>
</div>
    <div className="overflow-hidden rounded-xl border border-[#D8D1C5] bg-white">
      <table className="w-full text-left">
        <thead className="bg-[#FAF8F4] text-xs text-[#666]">
          <tr>
            <th className="px-4 py-4 text-center">
  <input
    type="checkbox"
    checked={
      filteredHistory.length > 0 &&
      filteredHistory.every((item) =>
        selectedHistoryIds.includes(item.id)
      )
    }
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedHistoryIds(filteredHistory.map((item) => item.id));
      } else {
        setSelectedHistoryIds([]);
      }
    }}
  />
</th>
            <th className="px-6 py-4">DATE</th>
            <th className="px-6 py-4">UNIT</th>
            <th className="px-6 py-4">ACTION</th>
            <th className="px-6 py-4">DETAIL</th>
          </tr>
        </thead>

        <tbody>
          {filteredHistory.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-16 text-center text-sm text-[#999]"
              >
                등록된 변경 이력이 없습니다.
              </td>
            </tr>
          ) : (
           filteredHistory.map((item, index) => (
              <tr
                key={`${item.id}-${index}`}
                className="border-t border-[#E8E2D8]"
              >
                <td className="px-4 py-5 text-center">
  <input
    type="checkbox"
    checked={selectedHistoryIds.includes(item.id)}
    onChange={(e) => {
      setSelectedHistoryIds((prev) =>
        e.target.checked
          ? [...prev, item.id]
          : prev.filter((id) => id !== item.id)

      );
    }}
  />
</td>
                <td className="px-6 py-5 text-sm">
                  {item.date}
                </td>

                <td className="px-6 py-5 text-sm font-medium">
                  {item.unit}
                </td>

                <td className="px-6 py-5">
                  <span className="rounded-full bg-[#F5E9D8] px-3 py-1 text-xs text-[#765A32]">
                    {item.action}
                  </span>
                </td>

                <td className="px-6 py-5 text-sm text-[#666]">
                  {item.detail}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
{activeMenu === "회원권 관리" && (
          <div className="p-10">

            <div className="flex items-end justify-between">

              <div>

                <p className="text-[11px] tracking-[4px] text-[#9A8359]">
                  MEMBERSHIP
                </p>

                <h2 className="mt-2 text-[38px] font-light">
                  회원권 관리
                </h2>

                <p className="mt-2 text-sm text-[#777]">
                  회원권 소유 및 이용 권한을 관리합니다.
                </p>

              </div>

              <button
                onClick={() => setShowRegister(true)}
                className="rounded-lg bg-[#651A1A] px-6 py-3 text-sm text-white hover:bg-[#511313]"
              >
                + 회원권 등록
              </button>
              <button
    onClick={() => setShowBulkRegister(true)}
    className="rounded-lg border border-[#651A1A] px-6 py-3 text-sm text-[#651A1A]"
>
    + 일괄 등록
</button>

            </div>

            {/* SEARCH */}

            <div className="mt-8 flex gap-3">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="호실 · 회원권 번호 · 소유자 검색"
                className="w-[400px] rounded-lg border border-[#D8D1C5] bg-white px-5 py-3 text-sm outline-none focus:border-[#8C6B3E]"
              />
<select
  value={floorFilter}
  onChange={(e) => setFloorFilter(e.target.value)}
  className="rounded-lg border border-[#E8E2D8] bg-white px-4 py-3 text-sm text-gray-600"
>
  <option value="ALL">전체 층</option>

  {[...new Set(
    members
      .map((member) => Math.floor(Number(member.unit) / 100))
      .filter((floor) => floor > 0)
  )]
    .sort((a, b) => a - b)
    .map((floor) => (
      <option key={floor} value={floor}>
        {floor}층
      </option>
    ))}
</select>
              {["ALL", "OWNER", "TEMPORARY", "HOLD"].map(
                (value) => (
                  <button
                    key={value}
                    onClick={() =>
                      setFilter(value as "ALL" | Status)
                    }
                    className={`rounded-lg px-4 text-xs ${
                      filter === value
                        ? "bg-[#651A1A] text-white"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {value === "ALL"
                      ? "전체"
                      : value === "OWNER"
                      ? "소유자"
                      : value === "TEMPORARY"
                      ? "일시승계"
                      : "HOLD"}
                  </button>
                )
              )}

            </div>

            {/* KPI */}

            <div className="mt-8 grid grid-cols-4 gap-5">

              <Kpi
                title="전체 회원권"
                value={String(members.length)}
              />

              <Kpi
                title="소유자 사용"
                value={String(
                  members.filter(
                    (m) => m.status === "OWNER"
                  ).length
                )}
              />

              <Kpi
                title="일시승계"
                value={String(
                  members.filter(
                    (m) => m.status === "TEMPORARY"
                  ).length
                )}
              />

              <Kpi
                title="HOLD"
                value={String(
                  members.filter(
                    (m) => m.status === "HOLD"
                  ).length
                )}
              />

            </div>

            {/* TABLE */}

            <div className="mt-8 overflow-hidden rounded-xl border border-[#DED8CE] bg-white">

              <table className="w-full text-left">

                <thead className="bg-[#FAF8F4] text-xs text-gray-500">

                  <tr>
                    <th className="px-6 py-4">UNIT</th>
                    <th className="px-6 py-4">MEMBERSHIP</th>
                    <th className="px-6 py-4">CURRENT USER</th>
                    <th className="px-6 py-4">구분</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">회사명</th>
                    <th className="px-6 py-4">END DATE</th>
                  </tr>

                </thead>

                <tbody>

                {[...filteredMembers]
  .sort((a, b) => Number(a.unit) - Number(b.unit))
  .map((member, index) => (
  <tr
    key={`${member.membershipNo}-${member.unit}-${index}`}
                      onClick={() => {
  setSelected(member);
  
}}
                      className="cursor-pointer border-t hover:bg-[#FBF8F2]"
                    >

                      <td className="px-6 py-5 font-medium">
                        {member.unit}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {member.membershipNo}
                      </td>

 <td className="px-6 py-5">
  <p className="text-sm">
    {member.currentUser}
  </p>
  <p className="text-xs text-gray-400">
    {member.currentUserPhone}
  </p>
</td>
<td className="px-6 py-5">
  <span
    className={`px-3 py-1 rounded-full text-xs ${
      member.memberType === "법인"
        ? "bg-[#F3E8E8] text-[#651A1A]"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {member.memberType || "개인"}
  </span>
</td>
                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${statusStyle[member.status]}`}
                        >
                          {statusLabel[member.status]}
                        </span>

                      </td>

                      <td className="px-6 py-5">
  <span className="text-sm">
    {member.memberType === "법인"
  ? member.companyName || "-"
  : member.occupation || "-"}
  </span>
</td>

                      <td className="px-6 py-5 text-sm">
                        {member.endDate || "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {filteredMembers.length === 0 && (
                <div className="py-16 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </div>
              )}

            </div>

          </div>
)}
{activeMenu === "일시승계" && (
  <div className="p-10">
    <div className="mb-8">
      <p className="text-[11px] tracking-[4px] text-[#9A8570]">
        MEMBERSHIP
      </p>

      <h2 className="mt-2 text-[38px] font-light">
        일시승계
      </h2>

      <p className="mt-2 text-sm text-[#777]">
        현재 일시승계 중인 회원권과 승계 기간을 관리합니다.
      </p>
    </div>

    <div className="mb-6 grid grid-cols-3 gap-4">
      <div className="rounded-xl border border-[#E8E2D8] bg-white p-5">
        <p className="text-xs text-[#9A8570]">TOTAL</p>
        <p className="mt-2 text-3xl font-light">
          {members.filter(
            (member) => member.status === "TEMPORARY"
          ).length}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          전체 일시승계
        </p>
      </div>

      <div className="rounded-xl border border-[#E8E2D8] bg-white p-5">
        <p className="text-xs text-[#9A8570]">ACTIVE</p>
        <p className="mt-2 text-3xl font-light">
          {
            members.filter(
              (member) =>
                member.status === "TEMPORARY" &&
                member.assignmentStart
            ).length
          }
        </p>
        <p className="mt-1 text-xs text-gray-500">
          현재 사용중
        </p>
      </div>

      <div className="rounded-xl border border-[#E8E2D8] bg-white p-5">
        <p className="text-xs text-[#9A8570]">RETURN</p>
        <p className="mt-2 text-3xl font-light">
          {
            members.filter(
              (member) =>
                member.status === "TEMPORARY" &&
                member.assignmentEnd
            ).length
          }
        </p>
        <p className="mt-1 text-xs text-gray-500">
          승계 종료일 등록
        </p>
      </div>
    </div>

    <div className="overflow-hidden rounded-xl border border-[#DDD5C9] bg-white">
      
      <table className="w-full">
        <thead className="bg-[#FAF8F4]">
          <tr className="text-left text-xs text-[#666]">
            <th className="px-6 py-4">UNIT</th>
            <th className="px-6 py-4">MEMBERSHIP NO.</th>
            <th className="px-6 py-4">OWNER</th>
            <th className="px-6 py-4">CURRENT USER</th>
            <th className="px-6 py-4">START</th>
            <th className="px-6 py-4">END</th>
            <th className="px-6 py-4">남은 기간</th>
            <th className="px-6 py-4">STATUS</th>
          </tr>
        </thead>

        <tbody>
          {members
            .filter((member) => member.status === "TEMPORARY")
            .map((member) => (
              <tr
                key={member.membershipNo}
                 onClick={() => setSelected(member)}
                className="border-t border-[#E8E2D8] hover:bg-[#FAF8F4] cursor-pointer"
              >
                <td className="px-6 py-5 font-medium">
                  {member.unit}
                </td>

                <td className="px-6 py-5 text-sm">
                  {member.membershipNo}
                </td>

                <td className="px-6 py-5">
                  <p className="text-sm">{member.owner}</p>
                  <p className="text-xs text-gray-400">
                    {member.ownerPhone}
                  </p>
                </td>

                <td className="px-6 py-5">
                  <p className="text-sm">
  {member.status === "OWNER"
    ? member.owner
    : member.currentUser || "-"}
</p>

<p className="text-xs text-gray-400">
  {member.status === "OWNER"
    ? member.ownerPhone
    : member.currentUserPhone || ""}
</p>
                </td>

                <td className="px-6 py-5 text-sm">
                  {member.assignmentStart || "-"}
                </td>

                <td className="px-6 py-5 text-sm">
                  {member.assignmentEnd || "-"}
                </td>
<td className="px-6 py-5 font-medium">
  {(() => {
    if (!member.assignmentEnd) return "-";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(member.assignmentEnd);
    endDate.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return "종료";
    if (daysLeft === 0) return "오늘 종료";
    return `D-${daysLeft}`;
  })()}
</td>
                <td className="px-6 py-5">
                  <span className="rounded-full bg-[#F4E8D6] px-3 py-1 text-xs">
                    {getAssignmentStatus(member.assignmentEnd)}
                  </span>
                </td>
              </tr>
            ))}

          {members.filter(
            (member) => member.status === "TEMPORARY"
          ).length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="py-16 text-center text-sm text-gray-400"
              >
                현재 일시승계 중인 회원권이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
{activeMenu === "이력" && (
  <div className="p-10">

    <div className="mb-8">
      <p className="text-[11px] tracking-[4px] text-[#9A8570]">
        MEMBER RELATIONS
      </p>

      <h2 className="mt-2 text-[38px] font-light">
        관리 이력
      </h2>

      <p className="mt-2 text-sm text-[#777]">
        회원권 및 호실과 관련된 모든 변경 및 처리 기록을 확인합니다.
      </p>
    </div>

    <div className="overflow-hidden rounded-xl border border-[#E8E2D8] bg-white">

 <table className="w-full">
  <thead className="bg-[#FAF8F4]">
    <tr className="text-left text-xs text-[#666]">
      <th className="px-5 py-4">일시</th>
      <th className="px-5 py-4">호실</th>
      <th className="px-5 py-4">구분</th>
      <th className="px-5 py-4">요청자</th>
      <th className="px-5 py-4">처리자</th>
      <th className="px-5 py-4">내용</th>
    </tr>
  </thead>

  <tbody>
    {filteredHistory.length === 0 ? (
      <tr>
        <td
          colSpan={6}
          className="px-5 py-16 text-center text-sm text-gray-400"
        >
          등록된 관리 이력이 없습니다.
        </td>
      </tr>
    ) : (
      filteredHistory.map((item, index) => (
        <tr
          key={`${item.id}-${index}`}
          className="border-t border-[#E8E2D8] hover:bg-[#FAF8F4]"
        >
          <td className="px-5 py-5 text-sm whitespace-nowrap">
            {item.date}
          </td>

          <td className="px-5 py-5 text-sm font-medium">
            {item.unit}
          </td>

          <td className="px-5 py-5">
            <span className="rounded-full bg-[#F5E9D8] px-3 py-1 text-xs">
              {item.category || item.action}
            </span>
          </td>

          <td className="px-5 py-5 text-sm text-[#666]">
            {item.requester || "-"}
          </td>

          <td className="px-5 py-5 text-sm text-[#666]">
            {item.handler || "-"}
          </td>

      <td className="px-5 py-5 text-sm text-[#666]">
  {editingHistoryId === item.id ? (
    <div className="space-y-2">
      <textarea
        value={editingHistoryText}
        onChange={(e) => setEditingHistoryText(e.target.value)}
        className="min-h-[90px] w-full rounded-lg border border-[#DED8CE] px-3 py-2 text-sm"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setEditingHistoryId(null);
            setEditingHistoryText("");
          }}
          className="rounded-md border border-[#DED8CE] px-3 py-1 text-xs"
        >
          취소
        </button>

        <button
          type="button"
          onClick={async () => {
            const { error: historyUpdateError } = await supabase
  .from("History")
  .update({
    detail: editingHistoryText,
  })
  .eq("id", item.id);

if (historyUpdateError) {
  console.error("History 수정 실패:", historyUpdateError);
  alert("이력 수정 중 오류가 발생했습니다.");
  return;
}
            setHistory((prev) =>
              prev.map((historyItem) =>
                historyItem.id === item.id
                  ? {
                      ...historyItem,
                      note: editingHistoryText,
                      detail: editingHistoryText,
                    }
                  : historyItem
              )
            );

            setEditingHistoryId(null);
            setEditingHistoryText("");
          }}
          className="rounded-md bg-[#651A1A] px-3 py-1 text-xs text-white"
        >
          저장
        </button>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-3">
      <span>{item.note || item.detail || "-"}</span>

      <button
        type="button"
        onClick={() => {
          setEditingHistoryId(item.id);
          setEditingHistoryText(item.note || item.detail || "");
        }}
        className="shrink-0 rounded-md border border-[#DED8CE] px-3 py-1 text-xs text-[#651A1A] hover:bg-[#FAF8F4]"
      >
        수정
      </button>
    </div>
  )}
</td>
        </tr>
      ))
    )}
  </tbody>
</table>

    </div>
  </div>
)}
        </section>

      </div>

      {/* REGISTER DRAWER */}

      {showRegister && (

        <div className="fixed inset-0 z-50">

          <button
            onClick={() => setShowRegister(false)}
            className="absolute inset-0 bg-black/30"
          />

          <aside className="absolute right-0 top-0 h-full w-[520px] overflow-y-auto bg-[#FAF8F4] shadow-2xl">

            <div className="bg-[#651A1A] px-8 py-7 text-white">

              <p className="text-[10px] tracking-[3px] text-[#D8BF85]">
                MEMBERSHIP
              </p>

              <h2 className="mt-2 text-3xl font-light">
                회원권 등록
              </h2>

            </div>

            <div className="space-y-5 p-8">

              <Field
                label="호실"
                value={form.unit}
                onChange={(value) =>
                  setForm({ ...form, unit: value })
                }
                placeholder="예: 3609"
              />

              <Field
                label="회원권 번호"
                value={form.membershipNo}
                onChange={(value) =>
                  setForm({
                    ...form,
                    membershipNo: value,
                  })
                }
                placeholder="예: TPH-3609"
              />

              <Field
                label="소유자"
                value={form.owner}
                onChange={(value) =>
                  setForm({ ...form, owner: value })
                }
                placeholder="소유자 성명"
              />

              <Field
                label="소유자 연락처"
                value={form.ownerPhone}
                onChange={(value) =>
                  setForm({
                    ...form,
                    ownerPhone: value,
                  })
                }
                placeholder="010-0000-0000"
              />

              <div>

                <label className="text-xs text-gray-500">
                  사용 형태
                </label>

                <select
                  value={form.contractType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contractType: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <option>자가사용</option>
                  <option>임대</option>
                  <option>단기임대</option>
                </select>

              </div>

              {form.contractType !== "자가사용" && (

                <>

                  <Field
                    label="현재 사용자"
                    value={form.currentUser}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        currentUser: value,
                      })
                    }
                    placeholder="임차인 / 실사용자"
                  />

                  <Field
                    label="현재 사용자 연락처"
                    value={form.currentUserPhone}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        currentUserPhone: value,
                      })
                    }
                    placeholder="010-0000-0000"
                  />

                </>

              )}

              <div className="grid grid-cols-2 gap-4">

                <Field
                  label="계약 시작일"
                  value={form.startDate}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      startDate: value,
                    })
                  }
                  placeholder="2026.08.01"
                />

                <Field
                  label="계약 종료일"
                  value={form.endDate}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      endDate: value,
                    })
                  }
                  placeholder="2027.07.31"
                />

              </div>

              <button
                onClick={registerMembership}
                className="mt-4 w-full rounded-lg bg-[#651A1A] py-4 text-sm text-white hover:bg-[#511313]"
              >
                회원권 등록
              </button>

              <button
                onClick={() => setShowRegister(false)}
                className="w-full rounded-lg border border-gray-200 bg-white py-4 text-sm text-gray-600"
              >
                취소
              </button>

            </div>

          </aside>

        </div>

      )}
{showBulkRegister && (
  <div className="fixed inset-0 z-50">
    <button
      onClick={() => setShowBulkRegister(false)}
      className="absolute inset-0 bg-black/30"
    />

    <aside className="absolute right-0 top-0 h-full w-[620px] overflow-y-auto bg-white shadow-xl">
      <div className="bg-[#651A1A] px-8 py-7 text-white">
        <p className="text-[10px] tracking-[3px] text-[#D8B58C]">
          MEMBERSHIP
        </p>
        <h2 className="mt-2 text-3xl font-light">
          회원 일괄 등록
        </h2>
      </div>

      <div className="p-8">
        <p className="text-sm text-gray-600 leading-6">
          엑셀에서 회원정보를 복사하여 아래 영역에 붙여넣어 주세요.
          <br />
          각 회원은 한 줄씩 입력합니다.
        </p>

        <div className="mt-5 rounded-lg bg-[#F8F4EE] p-4 text-xs text-gray-600 leading-6">
          입력 순서
          <br />
          <strong>
            호실 → 회원권번호 → 소유자 → 소유자 연락처 → 현재 사용자 →
            사용자 연락처 → 사용형태 → 계약 시작일 → 계약 종료일 →
            승계 시작일 → 승계 종료일
          </strong>
        </div>

     <textarea
  value={bulkText}
  onChange={(e) => setBulkText(e.target.value)}
  placeholder={"예시:\n3604\tTPH-3604\t홍길동\t010-1111-1111\t홍길동\t010-1111-1111\t자가사용\t2026.06.20\t2028.06.19\n3605\tTPH-3605\t김철수\t010-2222-2222\t이영희\t010-3333-3333\t임대\t2026.08.01\t2027.07.31\t2026.08.01\t2027.07.31"}
  className="mt-5 h-[360px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm outline-none focus:border-[#651A1A]"
/>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setShowBulkRegister(false)}
            className="w-full rounded-lg border border-gray-300 py-4 text-sm"
          >
            취소
          </button>

          <button
            onClick={registerBulkMembers}
            className="w-full rounded-lg bg-[#651A1A] py-4 text-sm text-white"
          >
            일괄 등록
          </button>
        </div>
      </div>
    </aside>
  </div>
)}
      {/* DETAIL DRAWER */}

      {selected && (

        <div className="fixed inset-0 z-50">

          <button
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-black/30"
          />

          <aside className="absolute right-0 top-0 h-full w-[520px] overflow-y-auto bg-[#FAF8F4] shadow-2xl">

            <div className="bg-[#651A1A] px-8 py-8 text-white">

              <div className="flex justify-between">

                <div>

                  <p className="text-xs text-[#D8BF85]">
                    MEMBERSHIP DETAIL
                  </p>

                  <h2 className="mt-2 text-3xl">
                    {selected.unit}
                  </h2>

                  <p className="mt-1 text-xs text-white/50">
                    {selected.membershipNo}
                  </p>

                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="text-2xl"
                >
                  ×
                </button>

              </div>

            </div>

            <div className="space-y-5 p-8">

              <DetailCard
                title="OWNER"
                value={selected.owner}
                sub={selected.ownerPhone}
              />

              <DetailCard
                title="CURRENT USER"
                value={selected.currentUser}
                sub={selected.currentUserPhone}
              />

              <DetailCard
  title="STATUS"
  value={statusLabel[selected.status]}
  sub={selected.contractType}
/>
<button
  onClick={() => {
  setForm({
    unit: selected.unit,
    membershipNo: selected.membershipNo,
    owner: selected.owner,
    ownerPhone: selected.ownerPhone,
    companyName: selected.companyName || "",
    occupation: selected.occupation || "",
    memo: selected.memo || "",
    currentUser: selected.currentUser,
    currentUserPhone: selected.currentUserPhone,
    memberType: selected.memberType || "개인",
    contractType: selected.contractType,
    startDate: selected.startDate,
    endDate: selected.endDate,
    assignmentStart: selected.assignmentStart || "",
    assignmentEnd: selected.assignmentEnd || "",
});

    setShowEdit(true);
  }}
  className="w-full rounded-lg bg-[#651A1A] py-4 text-sm text-white"
>
  회원정보 수정
</button>

<button
  type="button"
    onClick={() => setShowLog(true)}
  className="w-full rounded-lg border border-[#651A1A] py-4 text-sm text-[#651A1A]"
>
  + 관리 기록
</button>
{selected.status !== "TEMPORARY" && (
  <button
    onClick={() => setShowAssignment(true)}
    className="w-full rounded-lg bg-[#651A1A] py-4 text-sm text-white hover:bg-[#511313]"
  >
    + 일시승계
    
  </button>
)}
{selected.status === "TEMPORARY" && (
  <button
    onClick={async () => {
      const confirmed = window.confirm(
        `${selected.unit}호의 일시승계를 종료하고 소유자에게 사용 권한을 복귀하시겠습니까?`
      );

      if (!confirmed) return;

      setMembers((prev) =>
        prev.map((member) =>
          member.membershipNo === selected.membershipNo
            ? {
                ...member,
                currentUser: member.owner,
                currentUserPhone: member.ownerPhone,
                status: "OWNER",
                assignmentStart: "",
                assignmentEnd: "",
              }
            : member
        )
      );

      setSelected({
        ...selected,
        currentUser: selected.owner,
        currentUserPhone: selected.ownerPhone,
        status: "OWNER",
        assignmentStart: "",
        assignmentEnd: "",
      });

     const assignmentEndHistoryItem = {
  id: Date.now(),
  date: new Date().toLocaleDateString("ko-KR"),
  unit: selected.unit,
  action: "일시승계 종료",
  detail: `${selected.currentUser} → ${selected.owner}`,
};

void saveHistoryToSupabase({
  date: assignmentEndHistoryItem.date,
  unit: assignmentEndHistoryItem.unit,
  action: assignmentEndHistoryItem.action,
  detail: assignmentEndHistoryItem.detail,
});

setHistory((prev) => [
  ...prev,
  assignmentEndHistoryItem,
]);
    }}
    className="w-full rounded-lg border border-[#651A1A] bg-white py-4 text-sm text-[#651A1A]"
  >
    일시승계 종료 · 소유자 복귀
  </button>
)}
<DetailCard
  title="CONTRACT PERIOD"
  value={selected.startDate || "-"}
  sub={`~ ${selected.endDate || "-"}`}
/>

              {selected.assignmentStart && (
                <DetailCard
                  title="TEMPORARY ASSIGNMENT"
                  value={selected.assignmentStart}
                  sub={`~ ${selected.assignmentEnd}`}
                />
              )}
<DetailCard
  title="MEMO"
  value={selected.memo || "등록된 비고가 없습니다."}
    sub=""
/>
<DetailCard
  title="LAST UPDATED"
  value={selected.updatedBy || "기존 등록 데이터"}
  sub={
    selected.updatedAt
      ? new Date(selected.updatedAt).toLocaleString("ko-KR")
      : "-"
  }
/>
            </div>

          </aside>
          {/* EDIT DRAWER */}
{showEdit && selected && (
  <div className="fixed inset-0 z-50">
    <button
      onClick={() => setShowEdit(false)}
      className="absolute inset-0 bg-black/30"
    />

    <aside className="absolute right-0 top-0 h-full w-[520px] bg-white overflow-y-auto">
      <div className="bg-[#651A1A] px-8 py-7 text-white">
        <p className="text-[10px] tracking-[3px] text-[#D8BF85]">
          MEMBERSHIP
        </p>

        <h2 className="mt-2 text-3xl font-light">
          회원정보 수정
        </h2>
      </div>

      <div className="space-y-5 p-8">

        <Field
          label="호실"
          value={form.unit}
          onChange={(value) =>
            setForm({ ...form, unit: value })
          }
          placeholder="예: 3601"
        />

        <Field
          label="회원권 번호"
          value={form.membershipNo}
          onChange={(value) =>
            setForm({ ...form, membershipNo: value })
          }
          placeholder="예: TPH-3601"
        />

        <Field
          label="소유자"
          value={form.owner}
          onChange={(value) =>
            setForm({ ...form, owner: value })
          }
          placeholder="소유자명"
        />
<div>
  <label className="text-xs text-gray-500">
    회원 구분
  </label>
{form.memberType === "법인" ? (
  <Field
    label="회사명"
    value={form.companyName || ""}
    onChange={(value) =>
      setForm({ ...form, companyName: value })
    }
    placeholder="회사명을 입력해주세요"
  />
) : (
  <Field
    label="직업"
    value={form.occupation || ""}
    onChange={(value) =>
      setForm({ ...form, occupation: value })
    }
    placeholder="직업을 입력해주세요"
  />
)}
<div className="mt-4">
  <label className="text-xs text-gray-500">비고</label>
  <textarea
    value={form.memo || ""}
    onChange={(e) =>
      setForm({ ...form, memo: e.target.value })
    }
    className="mt-2 min-h-[120px] w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
    placeholder="관리 기록 및 비고를 입력해주세요"
  />
</div>
  <div className="mt-2 flex gap-2">
    <button
      type="button"
      onClick={() =>
        setForm({ ...form, memberType: "개인" })
      }
      className={`flex-1 rounded-lg border py-3 text-sm ${
        form.memberType === "개인"
          ? "bg-[#651A1A] text-white border-[#651A1A]"
          : "bg-white text-[#651A1A] border-[#DED8CE]"
      }`}
    >
      개인
    </button>

    <button
      type="button"
      onClick={() =>
        setForm({ ...form, memberType: "법인" })
      }
      className={`flex-1 rounded-lg border py-3 text-sm ${
        form.memberType === "법인"
          ? "bg-[#651A1A] text-white border-[#651A1A]"
          : "bg-white text-[#651A1A] border-[#DED8CE]"
      }`}
    >
      법인
    </button>
  </div>
</div>
        <Field
          label="소유자 연락처"
          value={form.ownerPhone}
          onChange={(value) =>
            setForm({ ...form, ownerPhone: value })
          }
          placeholder="010-0000-0000"
        />

        <Field
          label="현재 사용자"
          value={form.currentUser}
          onChange={(value) =>
            setForm({ ...form, currentUser: value })
          }
          placeholder="임차인 / 실사용자"
        />

        <Field
          label="현재 사용자 연락처"
          value={form.currentUserPhone}
          onChange={(value) =>
            setForm({ ...form, currentUserPhone: value })
          }
          placeholder="010-0000-0000"
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="계약 시작일"
            value={form.startDate}
            onChange={(value) =>
              setForm({ ...form, startDate: value })
            }
            placeholder="2026.01.01"
          />

          <Field
            label="계약 종료일"
            value={form.endDate}
            onChange={(value) =>
              setForm({ ...form, endDate: value })
            }
            placeholder="2028.06.19"
          />
        </div>
<div className="grid grid-cols-2 gap-4">
    <Field
        label="승계 시작일"
        value={form.assignmentStart}
        onChange={(value) =>
            setForm({
                ...form,
                assignmentStart: value,
            })
        }
        placeholder="2026.08.01"
    />

    <Field
        label="승계 종료일"
        value={form.assignmentEnd}
        onChange={(value) =>
            setForm({
                ...form,
                assignmentEnd: value,
            })
        }
        placeholder="2027.07.31"
    />
</div>
        <button
          onClick={updateMembership}
          className="mt-4 w-full rounded-lg bg-[#651A1A] py-4 text-sm text-white"
        >
          수정 저장
        </button>
<button
  onClick={async () => {
    const confirmed = window.confirm(
      `${form.unit}호 회원권을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`
    );

    if (!confirmed) return;
const { error: deleteError } = await supabase
  .from("Member")
  .delete()
  .eq("membership_no", form.membershipNo);

if (deleteError) {
  console.error("회원 삭제 Supabase 실패:", deleteError);
  alert("회원 삭제 중 오류가 발생했습니다.");
  return;
}
    setMembers((prev) =>
      prev.filter((member) => member.membershipNo !== form.membershipNo)
    );

   const deleteHistoryItem = {
  id: Date.now(),
  date: new Date().toISOString().slice(0, 10),
  unit: form.unit,
  action: "회원 삭제",
  detail: `${form.membershipNo} ${form.owner} 회원 삭제`,
};

void saveHistoryToSupabase({
  date: deleteHistoryItem.date,
  unit: deleteHistoryItem.unit,
  action: deleteHistoryItem.action,
  detail: deleteHistoryItem.detail,
});

setHistory((prev) => [
  ...prev,
  deleteHistoryItem,
]);

    setShowEdit(false);
    setSelected(null);
  }}
  className="w-full rounded-lg border border-red-300 py-4 text-red-600"
>
  회원 삭제
</button>
        <button
          onClick={() => setShowEdit(false)}
          className="w-full rounded-lg border border-gray-200 py-4 text-sm"
        >
          취소
        </button>

      </div>
    </aside>
  </div>
)}
{showAssignment && selected && (
  <AssignmentDrawer
    unit={selected.unit}
    membershipNo={selected.membershipNo}
    owner={selected.owner}
    onClose={() => setShowAssignment(false)}
    onSave={async (data) => {
      console.log("승계 저장 데이터:", data);

      setMembers((prev) =>
        prev.map((member) =>
          member.membershipNo === selected.membershipNo
            ? {
                ...member,
                currentUser: data.currentUser,
                currentUserPhone: data.currentUserPhone,
                status: "TEMPORARY",
                assignmentStart: data.assignmentStart,
                assignmentEnd: data.assignmentEnd,
              }
            : member
        )
      );
const { error: assignmentError } = await supabase
  .from("Member")
  .update({
    current_user: data.currentUser,
    current_user_phone: data.currentUserPhone,
    status: "TEMPORARY",
    assignment_start: data.assignmentStart,
    assignment_end: data.assignmentEnd,
  })
  .eq("membership_no", selected.membershipNo);

if (assignmentError) {
  console.error("일시승계 Supabase 저장 실패:", assignmentError);
  alert("일시승계 저장 중 오류가 발생했습니다.");
  return;
}
const assignmentHistoryItem = {
  id: Date.now(),
  date: new Date().toLocaleDateString("ko-KR"),
  unit: selected.unit,
  action: "일시승계 등록",
  detail: `${selected.owner} → ${data.currentUser} / ${data.assignmentStart} ~ ${data.assignmentEnd}`,
};

void saveHistoryToSupabase({
  date: assignmentHistoryItem.date,
  unit: assignmentHistoryItem.unit,
  action: assignmentHistoryItem.action,
  detail: assignmentHistoryItem.detail,
});

setHistory((prev) => [
  ...prev,
  assignmentHistoryItem,
]);
      setSelected({
        ...selected,
        currentUser: data.currentUser,
        currentUserPhone: data.currentUserPhone,
        status: "TEMPORARY",
        assignmentStart: data.assignmentStart,
        assignmentEnd: data.assignmentEnd,
      });

      setShowAssignment(false);
    }}
    
  />
  )}
  {showLog && selected && (
<div className="fixed inset-0 z-[9999]">
    <button
      onClick={() => setShowLog(false)}
      className="absolute inset-0 bg-black/30"
    />

    <aside className="absolute right-0 top-0 h-full w-[520px] overflow-y-auto bg-white shadow-xl">
      <div className="bg-[#651A1A] px-8 py-7 text-white">
        <p className="text-[10px] tracking-[3px] text-[#D8B56A]">
          MEMBER RELATIONS
        </p>
        <h2 className="mt-2 text-3xl font-light">
          관리 기록
        </h2>
        <p className="mt-2 text-sm text-white/70">
          {selected.unit}호 · {selected.membershipNo}
        </p>
      </div>

      <div className="space-y-5 p-8">

        <div>
          <label className="mb-2 block text-sm font-medium">
            요청자
          </label>
          <input
            id="log-requester"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            placeholder="회원명 또는 요청자"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            처리자
          </label>
          <input
            id="log-handler"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            placeholder="처리한 팀원"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            구분
          </label>
          <select
            id="log-category"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            defaultValue="회원 문의"
          >
            <option>회원 문의</option>
            <option>회원정보 수정</option>
            <option>일시승계</option>
            <option>승계 종료</option>
            <option>계약 변경</option>
            <option>서류 접수</option>
            <option>연락처 변경</option>
            <option>기타</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            내용
          </label>
          <textarea
            id="log-note"
            className="min-h-[160px] w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            placeholder="문의 및 처리 내용을 입력해주세요."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowLog(false)}
            className="w-1/2 rounded-lg border border-gray-300 py-4 text-sm"
          >
            취소
          </button>

          <button
           type="button"
            onClick={() => {
              const requester = (
                document.getElementById("log-requester") as HTMLInputElement
              )?.value;

              const handler = (
                document.getElementById("log-handler") as HTMLInputElement
              )?.value;

              const category = (
                document.getElementById("log-category") as HTMLSelectElement
              )?.value;

              const note = (
                document.getElementById("log-note") as HTMLTextAreaElement
              )?.value;

              if (!note.trim()) {
                alert("내용을 입력해주세요.");
                return;
              }

 const memoHistoryItem = {
  id: Date.now() + Math.random(),
  date: new Date().toLocaleString("ko-KR"),
  unit: selected.unit,
  action: category,
  detail: note,
  requester,
  handler,
  category,
  note,
};

void saveHistoryToSupabase({
  date: memoHistoryItem.date,
  unit: memoHistoryItem.unit,
  action: memoHistoryItem.action,
  detail: memoHistoryItem.detail,
});

setHistory((prev) => [
  memoHistoryItem,
  ...prev,
]);
setMembers((prev) =>
  prev.map((member) =>
    member.membershipNo === selected.membershipNo
      ? {
          ...member,
          memo: [member.memo, `[${category}] ${note}`]
            .filter(Boolean)
            .join("\n"),
        }
      : member
  )
);
              setShowLog(false);
            }}
            className="w-1/2 rounded-lg bg-[#651A1A] py-4 text-sm text-white"
          >
            기록 저장
          </button>
        </div>

      </div>
    </aside>
  </div>
)}
        </div>

      )}

    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="text-xs text-gray-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#8C6B3E]"
      />

    </div>
  );
}

function Kpi({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#DED8CE] bg-white p-6">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-4 text-4xl font-light">
        {value}
      </p>

    </div>
  );
}

function DetailCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-[#DED8CE] bg-white p-6">

      <p className="text-[10px] tracking-[2px] text-[#9A8359]">
        {title}
      </p>

      <p className="mt-4 text-xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {sub}
      </p>

    </div>
  );
}
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("로그인 실패:", error);
      alert("이메일 또는 비밀번호를 확인해주세요.");
    }
  }
  async function handleForgotPassword() {
    if (!email) {
      alert("비밀번호를 재설정할 이메일을 먼저 입력해주세요.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://the-privy-house-crm.vercel.app",
    });

    if (error) {
      console.error("비밀번호 재설정 메일 발송 실패:", error);
      alert("비밀번호 재설정 메일 발송에 실패했습니다.");
      return;
    }

    alert("비밀번호 재설정 메일을 발송했습니다. 이메일을 확인해주세요.");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F2EB] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#DED8CE] bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[5px] text-[#8D6B52]">
            THE PRIVY HOUSE
          </p>

          <h1 className="mt-4 text-3xl font-light text-[#651A1A]">
            MEMBER RELATIONS
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Membership Management System
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-lg border border-[#DED8CE] px-4 py-3 text-sm outline-none"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="비밀번호"
            className="w-full rounded-lg border border-[#DED8CE] px-4 py-3 text-sm outline-none"
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#651A1A] py-3 text-sm text-white disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <button
  type="button"
  onClick={handleForgotPassword}
  className="w-full text-center text-xs text-gray-500 hover:text-[#651A1A]"
>
  비밀번호를 잊으셨나요?
</button>
        </div>
      </div>
    </div>
  );
}
function PasswordResetScreen({ onDone }: { onDone: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    if (!newPassword || !confirmPassword) {
      alert("새 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      alert("비밀번호는 6자 이상으로 설정해주세요.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      console.error("비밀번호 변경 실패:", error);
      alert("비밀번호 변경에 실패했습니다.");
      return;
    }

    alert("비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.");

    await supabase.auth.signOut();
    onDone();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F2EB] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#DED8CE] bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[5px] text-[#8D6B52]">
            THE PRIVY HOUSE
          </p>

          <h1 className="mt-4 text-3xl font-light text-[#651A1A]">
            새 비밀번호 설정
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호"
            className="w-full rounded-lg border border-[#DED8CE] px-4 py-3 text-sm outline-none"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdatePassword();
            }}
            placeholder="새 비밀번호 확인"
            className="w-full rounded-lg border border-[#DED8CE] px-4 py-3 text-sm outline-none"
          />

          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full rounded-lg bg-[#651A1A] py-3 text-sm text-white disabled:opacity-50"
          >
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </div>
      </div>
    </div>
  );
}