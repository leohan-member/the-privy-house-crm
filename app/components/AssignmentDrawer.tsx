"use client";

import { useState } from "react";

type AssignmentDrawerProps = {
  unit: string;
  membershipNo: string;
  owner: string;
  onClose: () => void;
  onSave: (data: {
    currentUser: string;
    currentUserPhone: string;
    assignmentStart: string;
    assignmentEnd: string;
  }) => void;
};

export default function AssignmentDrawer({
  unit,
  membershipNo,
  owner,
  onClose,
  onSave,
}: AssignmentDrawerProps) {
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserPhone, setCurrentUserPhone] = useState("");
  const [assignmentStart, setAssignmentStart] = useState("");
  const [assignmentEnd, setAssignmentEnd] = useState("");

  function handleSave() {
    if (
      !currentUser ||
      !currentUserPhone ||
      !assignmentStart ||
      !assignmentEnd
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
const start = new Date(
  assignmentStart.replace(/\./g, "-")
);

const end = new Date(
  assignmentEnd.replace(/\./g, "-")
);

if (
  isNaN(start.getTime()) ||
  isNaN(end.getTime())
) {
  alert("승계 시작일과 종료일을 올바르게 입력해주세요.");
  return;
}

if (end < start) {
  alert("승계 종료일은 시작일보다 빠를 수 없습니다.");
  return;
}
    onSave({
      currentUser,
      currentUserPhone,
      assignmentStart,
      assignmentEnd,
    });
  }

  return (
    <div className="fixed inset-0 z-50">

      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <aside className="absolute right-0 top-0 h-full w-[520px] overflow-y-auto bg-[#FAF8F4] shadow-2xl">

        <div className="bg-[#651A1A] px-8 py-8 text-white">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[10px] tracking-[3px] text-[#D8BF85]">
                TEMPORARY ASSIGNMENT
              </p>

              <h2 className="mt-2 text-3xl font-light">
                일시승계 등록
              </h2>

              <p className="mt-2 text-xs text-white/50">
                {membershipNo}
              </p>

            </div>

            <button
              onClick={onClose}
              className="text-2xl"
            >
              ×
            </button>

          </div>

        </div>

        <div className="space-y-6 p-8">

          <section className="rounded-xl border border-[#DED8CE] bg-white p-6">

            <p className="text-[10px] tracking-[2px] text-[#9A8359]">
              MEMBERSHIP
            </p>

            <div className="mt-4 space-y-3">

              <Info
                label="호실"
                value={unit}
              />

              <Info
                label="회원권"
                value={membershipNo}
              />

              <Info
                label="회원권 소유자"
                value={owner}
              />

            </div>

          </section>

          <section className="rounded-xl border border-[#D9C49A] bg-[#FBF6EA] p-6">

            <p className="text-[10px] tracking-[2px] text-[#9A8359]">
              CURRENT USER
            </p>

            <div className="mt-5 space-y-4">

              <Field
                label="임차인 / 실사용자"
                value={currentUser}
                onChange={setCurrentUser}
                placeholder="성명"
              />

              <Field
                label="연락처"
                value={currentUserPhone}
                onChange={setCurrentUserPhone}
                placeholder="010-0000-0000"
              />

            </div>

          </section>

          <section className="rounded-xl border border-[#DED8CE] bg-white p-6">

            <p className="text-[10px] tracking-[2px] text-[#9A8359]">
              ASSIGNMENT PERIOD
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">

              <Field
                label="승계 시작일"
                value={assignmentStart}
                onChange={setAssignmentStart}
                placeholder="2026.08.01"
              />

              <Field
                label="승계 종료일"
                value={assignmentEnd}
                onChange={setAssignmentEnd}
                placeholder="2026.08.20"
              />

            </div>

          </section>

          <div className="rounded-lg bg-[#F0E9DE] p-4 text-xs leading-6 text-[#666]">

            승계 기간 동안 회원권의 현재 사용자는 임차인으로
            변경되며, 소유자의 사용 권한은 HOLD 상태로 관리됩니다.
            <br />
            승계 종료일 이후 소유자에게 회원권 사용 권한이 복귀됩니다.

          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-lg bg-[#651A1A] py-4 text-sm text-white hover:bg-[#511313]"
          >
            일시승계 등록
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 bg-white py-4 text-sm text-gray-600"
          >
            취소
          </button>

        </div>

      </aside>

    </div>
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
  placeholder: string;
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3">

      <span className="text-xs text-gray-400">
        {label}
      </span>

      <span className="text-sm">
        {value}
      </span>

    </div>
  );
}