import React, { useEffect, useMemo, useState } from "react";

// --- Config ---
const ROOMS = Array.from({ length: 12 }, (_, i) => ({ id: `R${i + 1}`, label: `Kamer ${i + 1}`, type: "room" }));
const STUDIOS = Array.from({ length: 4 }, (_, i) => ({ id: `S${i + 1}`, label: `Studio ${i + 1}`, type: "studio" }));
const ALL_UNITS = [...ROOMS, ...STUDIOS];

const STATUS = {
  empty: { key: "empty", label: "Leeg", bg: "bg-white", border: "border-gray-200", text: "text-gray-800" },
  reserved: { key: "reserved", label: "Reservering (zonder borg)", bg: "bg-red-100", border: "border-red-200", text: "text-red-800" },
  booked: { key: "booked", label: "Verhuurd", bg: "bg-green-100", border: "border-green-200", text: "text-green-800" },
};

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function ymd(date) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, "0"); const d = String(date.getDate()).padStart(2, "0"); return `${y}-${m}-${d}`; }

function KeyLegend() {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {Object.values(STATUS).map((s) => (
        <div key={s.key} className="flex items-center gap-2 text-sm">
          <div className={`w-4 h-4 rounded border ${s.bg} ${s.border}`} />
          <span className="text-gray-700">{s.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 text-sm">
        <div className="relative">
          <div className={`w-4 h-4 rounded border bg-white border-gray-200`} />
          <div className="absolute -top-1 -right-1 text-[9px] px-1 rounded bg-amber-100 border border-amber-300 text-amber-900">B</div>
        </div>
        <span className="text-gray-700">Borg ontvangen</span>
      </div>
    </div>
  );
}

function Toolbar({ selectedMonth, selectedYear, setMonth, setYear, filter, setFilter, onClearMonth, onExport, onImport, search, setSearch }) {
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - 1 + i);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className="border rounded px-2 py-1" value={selectedMonth} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(2000, i, 1).toLocaleString(undefined, { month: "long" })}
            </option>
          ))}
        </select>
        <select className="border rounded px-2 py-1" value={selectedYear} onChange={(e) => setYear(Number(e.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select className="border rounded px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Alle units</option>
          <option value="room">Alle kamers</option>
          <option value="studio">Alle studio’s</option>
        </select>
        <input
          className="border rounded px-2 py-1"
          placeholder="Zoek op naam huurder"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={onClearMonth}>Maand leegmaken</button>
        <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={onExport}>Exporteren</button>
        <label className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer">
          Importeren
          <input type="file" accept="application/json" className="hidden" onChange={onImport} />
        </label>
      </div>
    </div>
  );
}

function Cell({ value, onChange, onToggleDeposit }) {
  const s = STATUS[value?.status || "empty"]; 
  return (
    <button
      className={`w-full h-12 border ${s.border} ${s.bg} rounded relative group overflow-hidden`}
      title={(value?.name || "") + (value?.deposit ? " • Borg ontvangen" : "")}
      onClick={onChange}
      onAuxClick={(e) => { e.preventDefault(); onToggleDeposit?.(); }}
      onContextMenu={(e) => { e.preventDefault(); onToggleDeposit?.(); }}
    >
      {value?.name && (
        <span className={`absolute bottom-1 left-1 text-[10px] ${STATUS[value.status].text} truncate max-w-[85%]`}>{value.name}</span>
      )}
      {value?.deposit && (
        <span className="absolute top-0.5 right-0.5 text-[10px] leading-4 px-1 rounded bg-amber-100 border border-amber-300 text-amber-900">B</span>
      )}
    </button>
  );
}

function NamePopover({ open, onClose, value, onSave }) {
  const [name, setName] = useState(value?.name || "");
  const [deposit, setDeposit] = useState(!!value?.deposit);
  useEffect(() => { setName(value?.name || ""); setDeposit(!!value?.deposit); }, [value]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Gegevens reservering</h3>
        <label className="block text-sm mb-1 text-gray-600">Naam huurder</label>
        <input
          autoFocus
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Bijv. Fatima El Amrani"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSave({ ...value, name, deposit }); }}
        />
        <label className="flex items-center gap-2 text-sm mb-4 select-none">
          <input type="checkbox" checked={deposit} onChange={(e) => setDeposit(e.target.checked)} />
          <span>Borg ontvangen ($1500)</span>
        </label>
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>Tip: rechtsklik (of middelklik) op een dag om snel borg te togglen.</span>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-100" onClick={onClose}>Annuleren</button>
          <button className="px-3 py-1 rounded bg-gray-800 text-white" onClick={() => onSave({ ...value, name, deposit })}>Opslaan</button>
        </div>
      </div>
    </div>
  );
}

export default function RoomBookingApp() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem("booking-data-v2");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [editing, setEditing] = useState(null);

  useEffect(() => {
    localStorage.setItem("booking-data-v2", JSON.stringify(data));
  }, [data]);

  const units = useMemo(() => {
    const list = [...Array(12)].map((_, i) => ({ id: `R${i+1}`, label: `Kamer ${i+1}`, type: "room"}))
      .concat([...Array(4)].map((_, i) => ({ id: `S${i+1}`, label: `Studio ${i+1}`, type: "studio"})));
    if (!search.trim()) return list;
    const dim = daysInMonth(year, month);
    const keys = Array.from({ length: dim }, (_, i) => ymd(new Date(year, month, i + 1)));
    return list.filter((u) => keys.some((k) => (data?.[u.id]?.[k]?.name || "").toLowerCase().includes(search.toLowerCase())));
  }, [search, year, month, data]);

  const dim = daysInMonth(year, month);
  const dayKeys = Array.from({ length: dim }, (_, i) => ymd(new Date(year, month, i + 1)));

  function cycleStatus(current) {
    if (!current || current.status === STATUS.empty.key) return STATUS.reserved.key;
    if (current.status === STATUS.reserved.key) return STATUS.booked.key;
    return STATUS.empty.key;
  }

  function handleCellClick(unitId, dateKey) {
    const current = data?.[unitId]?.[dateKey];
    const nextStatus = cycleStatus(current);
    const next = { ...(current || {}), status: nextStatus };
    if (nextStatus === STATUS.empty.key) {
      next.name = "";
      next.deposit = false;
    } else if (!next.name) {
      setEditing({ unitId, dateKey });
    }
    setData((prev) => ({ ...prev, [unitId]: { ...(prev[unitId] || {}), [dateKey]: next } }));
  }

  function toggleDeposit(unitId, dateKey) {
    setData((prev) => {
      const curr = prev?.[unitId]?.[dateKey] || { status: STATUS.empty.key };
      const updated = { ...curr, deposit: !curr.deposit };
      return { ...prev, [unitId]: { ...(prev[unitId] || {}), [dateKey]: updated } };
    });
  }

  function saveName(value) {
    const { unitId, dateKey } = editing;
    setData((prev) => ({
      ...prev,
      [unitId]: { ...(prev[unitId] || {}), [dateKey]: { ...(prev[unitId]?.[dateKey] || {}), name: value.name || "", deposit: !!value.deposit } },
    }));
    setEditing(null);
  }

  function handleExport() {
    const payload = { version: 2, month, year, data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kamer-studio-planner_${year}-${String(month + 1).padStart(2, "0")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (json?.data) setData(json.data);
        if (Number.isInteger(json?.month)) setMonth(json.month);
        if (Number.isInteger(json?.year)) setYear(json.year);
      } catch (err) {
        alert("Kon dit bestand niet lezen. Zorg dat het een geldig JSON export is.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-6 max-w-[100vw]">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Kamer & Studio Planner</h1>
        <p className="text-gray-600">Klik op een dag om te wisselen: <span className="font-medium">wit</span> = leeg, <span className="font-medium text-red-700">rood</span> = reservering (zonder borg), <span className="font-medium text-green-700">groen</span> = verhuurd. <span className="font-medium">Rechtsklik</span> (of middelklik) om snel <span className="font-medium">borg (B)</span> te togglen. Naam toevoegen verschijnt bij reservering/verhuur.</p>
      </div>

      <div className="mb-4">
        <Toolbar
          selectedMonth={month}
          selectedYear={year}
          setMonth={setMonth}
          setYear={setYear}
          filter={filter}
          setFilter={setFilter}
          onClearMonth={() => {
            const keys = dayKeys;
            setData((prev) => {
              const copy = { ...prev };
              const all = ROOMS.concat(STUDIOS);
              for (const unit of all) {
                const unitData = { ...(copy[unit.id] || {}) };
                for (const k of keys) delete unitData[k];
                copy[unit.id] = unitData;
              }
              return copy;
            });
          }}
          onExport={handleExport}
          onImport={handleImport}
          search={search}
          setSearch={setSearch}
        />
      </div>

      <div className="mb-4"><KeyLegend /></div>

      <div className="overflow-auto border rounded-2xl">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="px-3 py-2 text-left w-48 border-b">Unit</th>
              {dayKeys.map((k, idx) => (
                <th key={k} className="px-2 py-2 border-b text-center">
                  <div className="leading-5">
                    <div className="font-medium">{idx + 1}</div>
                    <div className="text-[10px] text-gray-500">{new Date(year, month, idx + 1).toLocaleDateString(undefined, { weekday: "short" })}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROOMS.concat(STUDIOS).map((u) => (
              <tr key={u.id} className="odd:bg-gray-50">
                <td className="px-3 py-2 border-r whitespace-nowrap">
                  <div className="font-medium">{u.label}</div>
                  <div className="text-[11px] text-gray-500">{u.type === "room" ? "Kamer" : "Studio"}</div>
                </td>
                {dayKeys.map((k) => (
                  <td key={k} className="p-1">
                    <Cell
                      value={data?.[u.id]?.[k]}
                      onChange={() => handleCellClick(u.id, k)}
                      onToggleDeposit={() => toggleDeposit(u.id, k)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NamePopover
        open={!!editing}
        onClose={() => setEditing(null)}
        value={editing ? data?.[editing.unitId]?.[editing.dateKey] : null}
        onSave={saveName}
      />

      <div className="mt-6 text-xs text-gray-500">
        Tip: gegevens worden automatisch in je browser opgeslagen (localStorage). Gebruik Export/Import om een back-up te maken of te delen met collega’s.
      </div>

      <footer className="mt-6 text-xs text-gray-400">
        Locatie: Kaya Oktaaf • Nuts (water/elektra) & wifi inbegrepen • Elke unit eigen airco • Borg: $1500
      </footer>
    </div>
  );
}
