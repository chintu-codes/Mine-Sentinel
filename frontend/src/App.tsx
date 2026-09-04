import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Map,
  Users,
  Truck,
  Wind,
  Droplet,
  Wrench,
  Bell,
  FileText,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Shield,
  AlertTriangle,
  Fan,
  ThermometerSun,
  CloudRain,
  Gauge,
  Wifi,
  RefreshCw,
  Plus,
  Minus,
  Maximize2,
  Send,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Car,
  Sparkles,
  Search,
  Download,
  CheckCircle2,
  X,
  Save,
  Mail,
  MessageSquare,
  SmartphoneNfc,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";

// ============================================================
// Nav config
// ============================================================

type PageKey =
  | "dashboard"
  | "livemap"
  | "workers"
  | "vehicles"
  | "ventilation"
  | "water"
  | "equipment"
  | "alerts"
  | "reports"
  | "history"
  | "settings";

const NAV_ITEMS: { key: PageKey; icon: any; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "livemap", icon: Map, label: "Live Map" },
  { key: "workers", icon: Users, label: "Workers" },
  { key: "vehicles", icon: Truck, label: "Vehicles" },
  { key: "ventilation", icon: Wind, label: "Ventilation" },
  { key: "water", icon: Droplet, label: "Water" },
  { key: "equipment", icon: Wrench, label: "Equipment" },
  { key: "alerts", icon: Bell, label: "Alerts" },
  { key: "reports", icon: FileText, label: "Reports" },
  { key: "history", icon: HistoryIcon, label: "History" },
  { key: "settings", icon: SettingsIcon, label: "Settings" },
];

const PAGE_META: Record<PageKey, { title: string; sub: string }> = {
  dashboard: { title: "AI Mine Safety & Operations Copilot", sub: "Real-time Monitoring • AI Insights • Safer Mines" },
  livemap: { title: "Live Mine Map", sub: "Real-time zone, worker & vehicle tracking" },
  workers: { title: "Workers", sub: "Personnel status, location & PPE compliance" },
  vehicles: { title: "Vehicles & Machinery", sub: "Fleet status and utilization" },
  ventilation: { title: "Ventilation", sub: "Fan control, airflow & efficiency" },
  water: { title: "Water Management", sub: "Pump control & flood risk monitoring" },
  equipment: { title: "Equipment Health", sub: "Asset condition & maintenance" },
  alerts: { title: "Alerts", sub: "Active hazards across the site" },
  reports: { title: "Reports", sub: "Generate and download site reports" },
  history: { title: "History", sub: "Event & incident timeline" },
  settings: { title: "Settings", sub: "Notification & threshold preferences" },
};

// ============================================================
// Shared primitives
// ============================================================

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left text-[13px] transition-colors ${
        active
          ? "border-slate-800 bg-slate-100 font-semibold text-slate-900"
          : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <Icon size={16} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-sm border border-slate-200 bg-white p-4 min-w-0 break-words ${className}`}>{children}</div>;
}

function PanelHeader({ icon: Icon, color, bg, title }: { icon: any; color: string; bg: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon size={14} style={{ color }} strokeWidth={2.5} />
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700">{title}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11.5px] text-slate-400 truncate">{label}</span>
      <span className="text-[13px] font-semibold text-slate-700 truncate text-right">{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  color = "text-slate-700",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`mt-3 w-full rounded-sm border border-slate-300 bg-slate-50 py-1.5 text-[12px] font-bold transition-colors hover:bg-slate-200 ${color} ${className}`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-sm transition-colors ${checked ? "bg-slate-800" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-sm bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Operational: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Warning: "bg-amber-50 text-amber-700 border-amber-300",
    Idle: "bg-slate-100 text-slate-600 border-slate-300",
    Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    Generating: "bg-blue-50 text-blue-700 border-blue-200",
    Critical: "bg-rose-100 text-rose-700 border-rose-300",
    Maintenance: "bg-amber-50 text-amber-700 border-amber-300",
  };
  return (
    <span className={`rounded-sm border px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${map[status] ?? "bg-slate-50 text-slate-600 border-slate-300"}`}>
      {status}
    </span>
  );
}

function FilterTabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-sm border px-3 py-1 text-[11.5px] font-bold transition-colors ${
            value === opt
              ? "border-slate-800 bg-slate-800 text-white"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Donut({
  data,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  return (
    <div className="relative h-[92px] w-[92px] shrink-0">
      <PieChart width={92} height={92}>
        <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={44} paddingAngle={3} stroke="none">
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-bold text-slate-700">{centerValue}</span>
        <span className="text-[8px] text-slate-400">{centerLabel}</span>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11.5px] gap-2">
      <span className="flex items-center gap-1.5 text-slate-500 truncate">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="truncate">{label}</span>
      </span>
      <span className="font-medium text-slate-600 truncate text-right">{value}</span>
    </div>
  );
}

// ============================================================
// Sample data
// ============================================================

type Worker = { id: number; name: string; role: string; zone: string; status: "Safe" | "Warning" | "Critical"; ppe: boolean };
const INITIAL_WORKERS: Worker[] = [
  { id: 1, name: "Rajesh Kumar", role: "Drill Operator", zone: "Zone A", status: "Safe", ppe: true },
  { id: 2, name: "Amit Singh", role: "Electrician", zone: "Zone B", status: "Critical", ppe: false },
  { id: 3, name: "Suresh Patel", role: "Surveyor", zone: "Zone A", status: "Safe", ppe: true },
  { id: 4, name: "Vikram Rao", role: "Blaster", zone: "Zone C", status: "Warning", ppe: true },
  { id: 5, name: "Manoj Verma", role: "Maintenance Tech", zone: "Zone D", status: "Warning", ppe: true },
  { id: 6, name: "Deepak Nair", role: "Loader Operator", zone: "Zone B", status: "Critical", ppe: false },
  { id: 7, name: "Sanjay Gupta", role: "Safety Officer", zone: "Zone A", status: "Safe", ppe: true },
  { id: 8, name: "Arjun Mehta", role: "Drill Operator", zone: "Zone C", status: "Safe", ppe: true },
];

type Vehicle = { id: number; name: string; type: string; zone: string; status: "Active" | "Idle" | "Maintenance"; fuel: number };
const INITIAL_VEHICLES: Vehicle[] = [
  { id: 1, name: "Haul Truck 04", type: "Haul Truck", zone: "Zone A", status: "Active", fuel: 82 },
  { id: 2, name: "Excavator 02", type: "Excavator", zone: "Zone C", status: "Active", fuel: 64 },
  { id: 3, name: "Loader 07", type: "Loader", zone: "Zone B", status: "Idle", fuel: 45 },
  { id: 4, name: "Drill Rig 01", type: "Drill Rig", zone: "Zone A", status: "Active", fuel: 71 },
  { id: 5, name: "Bulldozer 03", type: "Bulldozer", zone: "Zone D", status: "Idle", fuel: 38 },
  { id: 6, name: "Haul Truck 09", type: "Haul Truck", zone: "Zone C", status: "Active", fuel: 90 },
  { id: 7, name: "Water Tanker 01", type: "Tanker", zone: "Zone B", status: "Maintenance", fuel: 12 },
  { id: 8, name: "Grader 02", type: "Grader", zone: "Zone D", status: "Idle", fuel: 55 },
];

type Equip = { id: number; name: string; health: number; status: "Operational" | "Warning" | "Critical" | "Scheduled"; last: string };
const INITIAL_EQUIPMENT: Equip[] = [
  { id: 1, name: "Ventilation Fan 02", health: 54, status: "Warning", last: "12 days ago" },
  { id: 2, name: "Pump Station C", health: 38, status: "Critical", last: "21 days ago" },
  { id: 3, name: "Conveyor Belt A", health: 91, status: "Operational", last: "2 days ago" },
  { id: 4, name: "Drill Rig 01", health: 88, status: "Operational", last: "5 days ago" },
  { id: 5, name: "Air Compressor 3", health: 76, status: "Operational", last: "9 days ago" },
  { id: 6, name: "Emergency Generator", health: 97, status: "Operational", last: "1 day ago" },
  { id: 7, name: "Haul Truck 09 Engine", health: 63, status: "Warning", last: "15 days ago" },
  { id: 8, name: "Sensor Hub Zone B", health: 45, status: "Critical", last: "18 days ago" },
];

type Alert = { id: number; severity: "Critical" | "High" | "Medium"; title: string; desc: string; zone: string; time: string; ack: boolean };
const INITIAL_ALERTS: Alert[] = [
  { id: 1, severity: "Critical", title: "HIGH GAS RISK - ZONE B", desc: "Methane level above threshold", zone: "Zone B", time: "10:44 AM", ack: false },
  { id: 2, severity: "Critical", title: "FLOOD RISK - ZONE C", desc: "Water level rising rapidly", zone: "Zone C", time: "10:42 AM", ack: false },
  { id: 3, severity: "High", title: "WORKER IN RESTRICTED ZONE", desc: "Worker detected in machinery zone", zone: "Zone B", time: "10:41 AM", ack: false },
  { id: 4, severity: "High", title: "VENTILATION EFFICIENCY LOW", desc: "Airflow below optimal in Zone D", zone: "Zone D", time: "10:40 AM", ack: false },
  { id: 5, severity: "Medium", title: "EQUIPMENT VIBRATION ANOMALY", desc: "Conveyor Belt A showing irregular vibration", zone: "Zone A", time: "10:35 AM", ack: false },
  { id: 6, severity: "Medium", title: "FUEL LEVEL LOW", desc: "Bulldozer 03 fuel below 40%", zone: "Zone D", time: "10:22 AM", ack: false },
  { id: 7, severity: "High", title: "TEMPERATURE SPIKE", desc: "Zone C ambient temperature rising", zone: "Zone C", time: "10:15 AM", ack: false },
  { id: 8, severity: "Critical", title: "PPE VIOLATION DETECTED", desc: "2 workers without helmets in Zone B", zone: "Zone B", time: "10:08 AM", ack: false },
];

type Report = { id: number; name: string; type: string; date: string; status: "Ready" | "Generating" };
const INITIAL_REPORTS: Report[] = [
  { id: 1, name: "Weekly Safety Summary", type: "Safety", date: "Sep 01, 2026", status: "Ready" },
  { id: 2, name: "Ventilation Performance Report", type: "Ventilation", date: "Aug 28, 2026", status: "Ready" },
  { id: 3, name: "Equipment Maintenance Log", type: "Equipment", date: "Aug 25, 2026", status: "Ready" },
  { id: 4, name: "Incident Report - Zone B Gas Leak", type: "Incident", date: "Aug 20, 2026", status: "Ready" },
];

const HISTORY_LOG = [
  { id: 1, time: "10:44 AM", type: "Alert", desc: "High gas risk triggered in Zone B" },
  { id: 2, time: "10:30 AM", type: "Maintenance", desc: "Pump Station C flagged for service" },
  { id: 3, time: "09:55 AM", type: "System", desc: "Edge gateway reconnected after brief outage" },
  { id: 4, time: "09:20 AM", type: "Alert", desc: "Worker PPE violation resolved in Zone A" },
  { id: 5, time: "08:45 AM", type: "Shift", desc: "Morning shift clocked in — 128 workers" },
  { id: 6, time: "07:30 AM", type: "System", desc: "Daily safety systems check completed" },
  { id: 7, time: "07:05 AM", type: "Maintenance", desc: "Ventilation Fan 02 flagged low efficiency" },
  { id: 8, time: "06:50 AM", type: "System", desc: "Night shift handover completed" },
];

// ============================================================
// Live map pieces
// ============================================================

function MapNode({ x, y, kind }: { x: number; y: number; kind: "worker" | "truck" | "car" }) {
  const base = "absolute -translate-x-1/2 -translate-y-1/2";
  if (kind === "worker") {
    return (
      <div
        className={`${base} flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white`}
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <Users size={9} className="text-white" />
      </div>
    );
  }
  return (
    <div
      className={`${base} flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {kind === "truck" ? <Truck size={11} className="text-white" /> : <Car size={11} className="text-white" />}
    </div>
  );
}

const ZONES = [
  { id: "A", x: 26, y: 30, label: "ZONE A", status: "SAFE", tone: "safe" as const, workers: 34, gas: "0.4%", temp: "26°C" },
  { id: "B", x: 57, y: 20, label: "ZONE B", status: "HIGH RISK", tone: "critical" as const, workers: 41, gas: "1.45%", temp: "29°C" },
  { id: "C", x: 73, y: 56, label: "ZONE C", status: "HIGH FLOOD RISK", tone: "critical" as const, workers: 28, gas: "0.6%", temp: "28°C" },
  { id: "D", x: 26, y: 68, label: "ZONE D", status: "WARNING", tone: "warning" as const, workers: 25, gas: "0.8%", temp: "27°C" },
];

function ZoneBadge({
  zone,
  onSelect,
  selected,
}: {
  zone: (typeof ZONES)[number];
  onSelect: () => void;
  selected: boolean;
}) {
  const styles = {
    safe: "border-emerald-300 bg-emerald-50 text-emerald-600",
    warning: "border-amber-300 bg-amber-50 text-amber-600",
    critical: "border-rose-300 bg-rose-50 text-rose-600",
  }[zone.tone];
  return (
    <button
      onClick={onSelect}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-1 text-center shadow-sm transition-transform hover:scale-105 ${styles} ${
        selected ? "ring-2 ring-offset-1 ring-indigo-400" : ""
      }`}
      style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
    >
      <div className="text-[11px] font-bold leading-tight">{zone.label}</div>
      <div className="text-[8.5px] font-medium leading-tight">{zone.status}</div>
    </button>
  );
}

function LiveMineMap({ compact, onNavigate }: { compact?: boolean; onNavigate: (p: PageKey) => void }) {
  const [zoom, setZoom] = useState(1);
  const [selectedZone, setSelectedZone] = useState<(typeof ZONES)[number] | null>(null);

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-semibold tracking-wide text-slate-600 truncate">LIVE MINE MAP</span>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" /> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" /> Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" /> Critical
          </span>
        </div>
      </div>

      <div className={`grid gap-4 ${selectedZone ? "lg:grid-cols-[1fr_220px]" : "grid-cols-1"}`}>
        <div className={`relative overflow-hidden rounded-lg bg-slate-50 ${compact ? "h-[320px]" : "h-[460px]"}`}>
          <div
            className="absolute inset-0 origin-center transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg viewBox="0 0 800 320" className="absolute inset-0 h-full w-full">
              <path
                d="M40 210 C 140 150, 200 120, 280 130 C 360 140, 380 90, 460 80 C 540 70, 600 120, 700 110"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M100 260 C 180 240, 260 260, 340 230 C 420 200, 480 220, 560 200 C 620 185, 660 160, 720 150"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path d="M280 130 C 300 180, 320 210, 340 230" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
              <path d="M460 80 C 470 130, 500 160, 560 200" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
              <ellipse cx="470" cy="255" rx="70" ry="26" fill="#bfdbfe" opacity="0.6" />
            </svg>

            {ZONES.map((z) => (
              <ZoneBadge key={z.id} zone={z} selected={selectedZone?.id === z.id} onSelect={() => setSelectedZone(z)} />
            ))}

            <MapNode x={20} y={45} kind="worker" />
            <MapNode x={33} y={38} kind="worker" />
            <MapNode x={41} y={53} kind="truck" />
            <MapNode x={47} y={45} kind="car" />
            <MapNode x={55} y={38} kind="worker" />
            <MapNode x={63} y={32} kind="worker" />
            <MapNode x={60} y={55} kind="worker" />
            <MapNode x={68} y={44} kind="truck" />
            <MapNode x={38} y={70} kind="truck" />
            <MapNode x={53} y={72} kind="car" />
            <MapNode x={70} y={68} kind="worker" />
            <MapNode x={80} y={75} kind="worker" />
          </div>

          <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))}
              className="flex h-7 w-7 items-center justify-center border-b border-slate-100 text-slate-500 hover:bg-slate-50"
            >
              <Plus size={13} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
              className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-50"
            >
              <Minus size={13} />
            </button>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => setZoom(1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-500 shadow-sm hover:bg-slate-50"
            >
              3D
            </button>
            <button
              onClick={() => setZoom(1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </div>

        {selectedZone && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-700">{selectedZone.label}</span>
              <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
            <StatusPill status={selectedZone.tone === "safe" ? "Safe" : selectedZone.tone === "warning" ? "Warning" : "Critical"} />
            <div className="mt-3 space-y-1.5">
              <StatRow label="Workers present" value={selectedZone.workers} />
              <StatRow label="Methane level" value={selectedZone.gas} />
              <StatRow label="Temperature" value={selectedZone.temp} />
            </div>
            <button
              onClick={() => onNavigate("alerts")}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-1.5 text-[12px] font-medium text-indigo-600 hover:bg-indigo-50"
            >
              View zone alerts
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// AI Copilot (dashboard)
// ============================================================

function AiCopilot() {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setResponse("Monitoring established. Zone B parameters are under continuous assessment.");
    }, 900);
  }

  return (
    <div className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        AI Safety Analysis
      </div>
      <div className="p-4 space-y-4">
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase text-slate-400">Risk Assessment</div>
          <div className="text-[13px] font-bold text-rose-600">HIGH — Zone B Methane Escalation</div>
          <p className="mt-1 text-[12px] text-slate-600">
            Methane concentration in Zone B has increased by 14% over the last 10 minutes while airflow has decreased by 9%.
          </p>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase text-slate-400">Recommended Response</div>
          <ul className="list-inside list-disc text-[12px] font-medium text-slate-700">
            <li>Increase Fan 02 to 85%</li>
            <li>Restrict worker entry into Zone B</li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-3">
          {response && (
            <div className="mb-3 border-l-2 border-indigo-500 bg-indigo-50 px-3 py-2 text-[11.5px] text-indigo-700">
              {response}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={thinking ? "Analyzing..." : "Query safety system..."}
              disabled={thinking}
              className="flex-1 rounded-sm border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700 outline-none focus:border-slate-400 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={thinking}
              className="rounded-sm bg-slate-800 px-3 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
            >
              Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Dashboard page
// ============================================================

function DashboardPage({
  onNavigate,
  alerts,
  onAck,
}: {
  onNavigate: (p: PageKey) => void;
  alerts: Alert[];
  onAck: (id: number) => void;
}) {
  const activeAlerts = alerts.filter((a) => !a.ack);
  const critical = activeAlerts.filter((a) => a.severity === "Critical").length;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col border-l-4 border-rose-600 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[16px] font-black uppercase tracking-wider text-rose-800">Critical Status</div>
          <div className="mt-1 text-[13px] font-medium text-rose-700">Immediate action required — active high-risk hazards detected.</div>
        </div>
        <div className="mt-3 text-left sm:mt-0 sm:text-right">
          <div className="text-[32px] font-black leading-none text-rose-700">
            82<span className="text-[16px] text-rose-500">/100</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-rose-600">Risk Score</div>
        </div>
      </div>

      {/* Active Incidents */}
      {critical > 0 && (
        <div className="border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Critical Incidents</span>
            <button onClick={() => onNavigate("alerts")} className="text-[11px] font-bold text-slate-500 hover:text-slate-800">
              VIEW ALL
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {activeAlerts.filter(a => a.severity === "Critical").map((a) => (
              <div key={a.id} className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-[13px] font-bold text-rose-700">{a.title}</div>
                  <div className="text-[12px] text-slate-500">{a.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-slate-700">{a.zone}</div>
                    <div className="text-[11px] text-slate-400">{a.time}</div>
                  </div>
                  <button
                    onClick={() => onAck(a.id)}
                    className="shrink-0 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    ACKNOWLEDGE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <LiveMineMap compact onNavigate={onNavigate} />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border border-slate-200 bg-white p-4">
              <PanelHeader icon={Wind} color="#64748b" bg="transparent" title="VENTILATION & GAS" />
              <div className="space-y-2">
                <StatRow label="Airflow" value="12.5 m³/s" />
                <StatRow label="Methane (CH₄)" value={<span className="text-rose-600">1.45 %</span>} />
                <StatRow label="CO" value="12 ppm" />
              </div>
              <ActionButton onClick={() => onNavigate("ventilation")}>View Details</ActionButton>
            </div>
            
            <div className="border border-slate-200 bg-white p-4">
              <PanelHeader icon={Droplet} color="#64748b" bg="transparent" title="WATER MGT" />
              <div className="space-y-2">
                <StatRow label="Level (Zone C)" value={<span className="text-rose-600">2.35 m</span>} />
                <StatRow label="Status" value={<span className="text-rose-600">HIGH RISK</span>} />
                <StatRow label="Pumps Active" value="2 / 3" />
              </div>
              <ActionButton onClick={() => onNavigate("water")}>View Details</ActionButton>
            </div>
            
            <div className="border border-slate-200 bg-white p-4">
              <PanelHeader icon={Users} color="#64748b" bg="transparent" title="WORKERS & ASSETS" />
              <div className="space-y-2">
                <StatRow label="Workers Active" value="128" />
                <StatRow label="PPE Compliance" value="92%" />
                <StatRow label="Equipment Online" value="87%" />
              </div>
              <ActionButton onClick={() => onNavigate("workers")}>View Details</ActionButton>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AiCopilot />
          
          <div className="border border-slate-200 bg-white">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              24-Hour Trend Overview
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-600">Methane Risk</span>
                <span className="flex items-center gap-1 text-[12px] font-bold text-rose-600">
                  <TrendingUp size={14} /> +14%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-600">Water Level</span>
                <span className="flex items-center gap-1 text-[12px] font-bold text-rose-600">
                  <TrendingUp size={14} /> +22%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-600">Ventilation Efficiency</span>
                <span className="flex items-center gap-1 text-[12px] font-bold text-slate-600">
                  <TrendingDown size={14} /> -9%
                </span>
              </div>
              <ActionButton onClick={() => onNavigate("reports")} className="mt-4">
                Full Trend Report
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Workers page
// ============================================================

function WorkersPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Worker | null>(null);

  const filtered = INITIAL_WORKERS.filter(
    (w) => (filter === "All" || w.status === filter) && w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <FilterTabs options={["All", "Safe", "Warning", "Critical"]} value={filter} onChange={setFilter} />
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
            <Search size={13} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workers..."
              className="bg-transparent text-[12px] text-slate-600 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-[12.5px] min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Zone</th>
                <th className="px-3 py-2 font-medium">PPE</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelected(w)}
                  className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 ${
                    selected?.id === w.id ? "bg-indigo-50/60" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 font-medium text-slate-700">{w.name}</td>
                  <td className="px-3 py-2.5 text-slate-500">{w.role}</td>
                  <td className="px-3 py-2.5 text-slate-500">{w.zone}</td>
                  <td className="px-3 py-2.5">
                    {w.ppe ? (
                      <span className="text-emerald-500">Compliant</span>
                    ) : (
                      <span className="text-rose-500">Violation</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill status={w.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                    No workers match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        {selected ? (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-slate-700 truncate">{selected.name}</span>
              <button onClick={() => setSelected(null)} className="shrink-0 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
            <StatusPill status={selected.status} />
            <div className="mt-3 space-y-1.5">
              <StatRow label="Role" value={selected.role} />
              <StatRow label="Current zone" value={selected.zone} />
              <StatRow label="PPE compliance" value={selected.ppe ? "Yes" : "No"} />
            </div>
            <ActionButton color="text-indigo-600">Message Worker</ActionButton>
            <ActionButton color="text-rose-600">Flag for Review</ActionButton>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center text-slate-400">
            <Users size={22} className="mb-2" />
            <span className="text-[12px]">Select a worker to view details</span>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================
// Vehicles page
// ============================================================

function VehiclesPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<number | null>(null);
  const filtered = INITIAL_VEHICLES.filter((v) => filter === "All" || v.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs options={["All", "Active", "Idle", "Maintenance"]} value={filter} onChange={setFilter} />
        <div className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
          Showing {filtered.length} vehicles
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-[12px]">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="p-3">Asset Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-40">Fuel / Power</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((v) => (
              <tr
                key={v.id}
                onClick={() => setSelected(selected === v.id ? null : v.id)}
                className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected === v.id ? "bg-slate-50" : ""}`}
              >
                <td className="p-3 font-bold text-slate-700">{v.name}</td>
                <td className="p-3 font-medium text-slate-600">{v.type}</td>
                <td className="p-3 text-slate-500">{v.zone}</td>
                <td className="p-3">
                  <StatusPill status={v.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full flex-1 overflow-hidden rounded-sm bg-slate-100">
                      <div
                        className={`h-full rounded-sm ${v.fuel > 50 ? "bg-emerald-500" : v.fuel > 20 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${v.fuel}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] font-bold text-slate-600">{v.fuel}%</span>
                  </div>
                </td>
                <td className="p-3">
                  {selected === v.id ? (
                    <div className="flex items-center gap-2">
                      <button className="rounded-sm bg-slate-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white hover:bg-slate-700">Track</button>
                      <button className="rounded-sm border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50">Recall</button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 hover:underline">Select</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-[12px] text-slate-400">No vehicles found.</div>}
      </div>
    </div>
  );
}

// ============================================================
// Ventilation page
// ============================================================

function VentilationPage() {
  const [fans, setFans] = useState([
    { id: 1, name: "Fan 01 — Zone A", on: true, speed: 72 },
    { id: 2, name: "Fan 02 — Zone B", on: true, speed: 85 },
    { id: 3, name: "Fan 03 — Zone C", on: true, speed: 60 },
    { id: 4, name: "Fan 04 — Zone D", on: false, speed: 0 },
    { id: 5, name: "Fan 05 — Main Shaft", on: false, speed: 0 },
  ]);

  const running = fans.filter((f) => f.on).length;
  const avgSpeed = Math.round(fans.filter((f) => f.on).reduce((s, f) => s + f.speed, 0) / (running || 1));
  const airflow = (running * 2.6 + avgSpeed * 0.03).toFixed(1);

  function toggleFan(id: number) {
    setFans((fs) => fs.map((f) => (f.id === id ? { ...f, on: !f.on, speed: !f.on ? 60 : 0 } : f)));
  }
  function setSpeed(id: number, speed: number) {
    setFans((fs) => fs.map((f) => (f.id === id ? { ...f, speed } : f)));
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
      <Card>
        <PanelHeader icon={Fan} color="#3b82f6" bg="#dbeafe" title="FAN CONTROL" />
        <div className="space-y-3">
          {fans.map((f) => (
            <div key={f.id} className="flex items-center gap-4 rounded-lg border border-slate-100 p-3">
              <Toggle checked={f.on} onChange={() => toggleFan(f.id)} />
              <div className="w-40 shrink-0">
                <div className="text-[12.5px] font-medium text-slate-700">{f.name}</div>
                <div className="text-[11px] text-slate-400">{f.on ? "Running" : "Stopped"}</div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={f.speed}
                disabled={!f.on}
                onChange={(e) => setSpeed(f.id, Number(e.target.value))}
                className="w-full accent-indigo-600 disabled:opacity-30"
              />
              <span className="w-10 shrink-0 text-right text-[12px] font-semibold text-slate-600">{f.speed}%</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <PanelHeader icon={Gauge} color="#6366f1" bg="#e0e7ff" title="LIVE READINGS" />
          <div className="space-y-3">
            <StatRow label="Fans running" value={`${running} / ${fans.length}`} />
            <StatRow label="Average speed" value={`${avgSpeed}%`} />
            <StatRow label="Airflow" value={`${airflow} m³/s`} />
            <StatRow label="Efficiency" value={`${Math.min(99, 40 + running * 12)}%`} />
          </div>
        </Card>
        <Card>
          <PanelHeader icon={AlertTriangle} color="#ef4444" bg="#fee2e2" title="ZONE B WARNING" />
          <p className="text-[12px] leading-relaxed text-slate-500">
            Methane in Zone B remains elevated. Recommend keeping Fan 02 above 80% until levels normalize.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Water page
// ============================================================

function WaterPage() {
  const [pumps, setPumps] = useState([
    { id: 1, name: "Pump 01 — Zone C Sump", on: true },
    { id: 2, name: "Pump 02 — Zone C Sump", on: true },
    { id: 3, name: "Pump 03 — Main Reservoir", on: false },
  ]);
  const running = pumps.filter((p) => p.on).length;
  const level = Math.max(0.4, 2.35 - running * 0.35).toFixed(2);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
      <Card>
        <PanelHeader icon={Droplet} color="#0ea5e9" bg="#e0f2fe" title="PUMP CONTROL" />
        <div className="space-y-3">
          {pumps.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <Toggle checked={p.on} onChange={() => setPumps((ps) => ps.map((x) => (x.id === p.id ? { ...x, on: !x.on } : x)))} />
                <div>
                  <div className="text-[12.5px] font-medium text-slate-700">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.on ? "Pumping" : "Idle"}</div>
                </div>
              </div>
              <StatusPill status={p.on ? "Active" : "Idle"} />
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <PanelHeader icon={Gauge} color="#6366f1" bg="#e0e7ff" title="ZONE C WATER LEVEL" />
          <div className="text-[26px] font-bold text-slate-800">{level} m</div>
          <div className="mt-1 text-[11.5px] font-semibold text-rose-500">
            {Number(level) > 1.5 ? "HIGH — flood risk" : "Normalizing"}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${Math.min(100, (Number(level) / 3) * 100)}%` }}
            />
          </div>
        </Card>
        <Card>
          <PanelHeader icon={AlertTriangle} color="#ef4444" bg="#fee2e2" title="FLOOD RISK" />
          <p className="text-[12px] leading-relaxed text-slate-500">
            Turning on more pumps lowers Zone C's water level. Keep at least 2 pumps running while risk is HIGH.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Equipment page
// ============================================================

function EquipmentPage() {
  const [items, setItems] = useState(INITIAL_EQUIPMENT);
  const [filter, setFilter] = useState("All");
  const filtered = items.filter((e) => filter === "All" || e.status === filter);

  function schedule(id: number) {
    setItems((its) => its.map((e) => (e.id === id ? { ...e, status: "Scheduled" as const } : e)));
  }

  return (
    <div className="space-y-4">
      <Card>
        <FilterTabs options={["All", "Operational", "Warning", "Critical", "Scheduled"]} value={filter} onChange={setFilter} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((e) => (
          <Card key={e.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-100">
                <Wrench size={15} className="text-violet-500" />
              </span>
              <StatusPill status={e.status} />
            </div>
            <div className="mt-3 truncate text-[13.5px] font-semibold text-slate-700">{e.name}</div>
            <div className="truncate text-[11.5px] text-slate-400">Last maintenance {e.last}</div>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Health</span>
                <span>{e.health}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${e.health > 70 ? "bg-emerald-500" : e.health > 45 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${e.health}%` }}
                />
              </div>
            </div>
            <ActionButton
              color={e.status === "Scheduled" ? "text-slate-400" : "text-violet-600"}
              onClick={() => e.status !== "Scheduled" && schedule(e.id)}
              className={e.status === "Scheduled" ? "cursor-not-allowed" : ""}
            >
              {e.status === "Scheduled" ? "Maintenance Scheduled" : "Schedule Maintenance"}
            </ActionButton>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Alerts page
// ============================================================

function AlertsPage({ alerts, onAck }: { alerts: Alert[]; onAck: (id: number) => void }) {
  const [filter, setFilter] = useState("Active");
  const active = alerts.filter((a) => !a.ack);
  const acked = alerts.filter((a) => a.ack);
  const bySeverity = (list: Alert[], sev: string) => (sev === "All" ? list : list.filter((a) => a.severity === sev));
  const list = filter === "Acknowledged" ? acked : bySeverity(active, filter === "Active" ? "All" : filter);

  const sevColor: Record<string, string> = { Critical: "text-rose-600 bg-rose-50 border-rose-200", High: "text-amber-600 bg-amber-50 border-amber-200", Medium: "text-sky-600 bg-sky-50 border-sky-200" };

  return (
    <div className="space-y-4">
      <Card>
        <FilterTabs options={["Active", "Critical", "High", "Medium", "Acknowledged"]} value={filter} onChange={setFilter} />
      </Card>

      <Card>
        <div className="space-y-2">
          {list.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
              <span className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${sevColor[a.severity]}`}>
                {a.severity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-[12.5px] font-bold text-slate-700">{a.title}</div>
                <div className="text-[12px] text-slate-400 line-clamp-2">{a.desc}</div>
                <div className="mt-1 truncate text-[11px] text-slate-300">
                  {a.zone} • {a.time}
                </div>
              </div>
              {!a.ack ? (
                <button
                  onClick={() => onAck(a.id)}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11.5px] font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle2 size={13} /> Acknowledge
                </button>
              ) : (
                <span className="shrink-0 text-[11px] font-medium text-slate-300">Acknowledged</span>
              )}
            </div>
          ))}
          {list.length === 0 && <div className="py-8 text-center text-[12.5px] text-slate-400">No alerts in this view.</div>}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// Reports page
// ============================================================

function ReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [toast, setToast] = useState("");

  function generate() {
    const id = Date.now();
    setReports((r) => [{ id, name: "Custom Site Report", type: "Custom", date: "Sep 04, 2026", status: "Generating" }, ...r]);
    setTimeout(() => {
      setReports((r) => r.map((rep) => (rep.id === id ? { ...rep, status: "Ready" } : rep)));
    }, 2200);
  }

  function download(name: string) {
    setToast(`Downloading "${name}"…`);
    setTimeout(() => setToast(""), 1800);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-700">Site Reports</span>
          <button
            onClick={generate}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-indigo-700"
          >
            <FileText size={13} /> Generate New Report
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50">
                  <FileText size={14} className="text-indigo-500" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-medium text-slate-700">{r.name}</div>
                  <div className="truncate text-[11px] text-slate-400">
                    {r.type} • {r.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={r.status} />
                <button
                  disabled={r.status !== "Ready"}
                  onClick={() => download(r.name)}
                  className="flex items-center gap-1 text-[12px] font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                >
                  <Download size={13} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-800 px-4 py-2.5 text-[12.5px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ============================================================
// History page
// ============================================================

function HistoryPage() {
  const [filter, setFilter] = useState("All");
  const list = HISTORY_LOG.filter((h) => filter === "All" || h.type === filter);
  const typeColor: Record<string, string> = {
    Alert: "bg-rose-400",
    Maintenance: "bg-amber-400",
    System: "bg-indigo-400",
    Shift: "bg-emerald-400",
  };

  return (
    <Card>
      <div className="mb-4">
        <FilterTabs options={["All", "Alert", "Maintenance", "System", "Shift"]} value={filter} onChange={setFilter} />
      </div>
      <div className="space-y-0">
        {list.map((h, i) => (
          <div key={h.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${typeColor[h.type]}`} />
              {i !== list.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <Clock size={11} className="shrink-0" /> {h.time}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{h.type}</span>
              </div>
              <div className="mt-1 text-[12.5px] text-slate-700 line-clamp-2">{h.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// Settings page
// ============================================================

function SettingsPage() {
  const [notif, setNotif] = useState({ email: true, sms: false, push: true });
  const [gasThreshold, setGasThreshold] = useState(1.2);
  const [waterThreshold, setWaterThreshold] = useState(2.0);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <PanelHeader icon={Bell} color="#6366f1" bg="#e0e7ff" title="NOTIFICATIONS" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12.5px] text-slate-600">
              <Mail size={14} className="text-slate-400" /> Email alerts
            </span>
            <Toggle checked={notif.email} onChange={(v) => setNotif((n) => ({ ...n, email: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12.5px] text-slate-600">
              <SmartphoneNfc size={14} className="text-slate-400" /> SMS alerts
            </span>
            <Toggle checked={notif.sms} onChange={(v) => setNotif((n) => ({ ...n, sms: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12.5px] text-slate-600">
              <MessageSquare size={14} className="text-slate-400" /> Push notifications
            </span>
            <Toggle checked={notif.push} onChange={(v) => setNotif((n) => ({ ...n, push: v }))} />
          </div>
        </div>
      </Card>

      <Card>
        <PanelHeader icon={Gauge} color="#ef4444" bg="#fee2e2" title="ALERT THRESHOLDS" />
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-slate-600">
              <span>Methane threshold</span>
              <span className="font-semibold text-slate-800">{gasThreshold.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={gasThreshold}
              onChange={(e) => setGasThreshold(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-slate-600">
              <span>Water level threshold</span>
              <span className="font-semibold text-slate-800">{waterThreshold.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.5}
              step={0.1}
              value={waterThreshold}
              onChange={(e) => setWaterThreshold(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <PanelHeader icon={ClipboardCheck} color="#10b981" bg="#d1fae5" title="ACCOUNT" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] text-slate-400">Display name</label>
            <input
              defaultValue="Site Supervisor"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12.5px] text-slate-700 outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Site</label>
            <input
              defaultValue="Copperbelt Site 4"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12.5px] text-slate-700 outline-none focus:border-indigo-400"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-[12.5px] font-medium text-white hover:bg-indigo-700"
          >
            <Save size={13} /> Save Changes
          </button>
          {saved && <span className="flex items-center gap-1 text-[12.5px] font-medium text-emerald-500"><CheckCircle2 size={14} /> Saved</span>}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// App shell
// ============================================================

export default function MineSafetyDashboard() {
  const [currentPage, setCurrentPage] = useState<PageKey>("dashboard");
  const [now, setNow] = useState(new Date());
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function ack(id: number) {
    setAlerts((as) => as.map((a) => (a.id === id ? { ...a, ack: true } : a)));
  }

  const meta = PAGE_META[currentPage];
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex h-full min-h-screen w-full bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-slate-50 px-3 py-4 lg:flex">
        <div className="mb-8 px-2">
          <div className="text-[14px] font-bold uppercase tracking-wider text-slate-800">Operations Control</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">System v4.2.1</div>
        </div>
        
        <nav className="flex-1 space-y-6">
          {[
            { title: "OPERATIONS", keys: ["dashboard", "livemap", "workers", "vehicles"] },
            { title: "SAFETY SYSTEMS", keys: ["ventilation", "water", "equipment", "alerts"] },
            { title: "RECORDS", keys: ["reports", "history"] },
            { title: "ADMINISTRATION", keys: ["settings"] },
          ].map((group) => (
            <div key={group.title}>
              <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.title}</div>
              <div className="space-y-0.5">
                {group.keys.map((key) => {
                  const item = NAV_ITEMS.find((i) => i.key === key)!;
                  return (
                    <SidebarItem
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      active={currentPage === item.key}
                      onClick={() => setCurrentPage(item.key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <h1 className="truncate text-[15px] font-bold uppercase tracking-wide text-slate-800">{meta.title}</h1>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <div className="hidden items-center gap-4 text-[12px] font-medium text-slate-500 sm:flex">
              <span>SITE: Copperbelt-04</span>
              <span>SHIFT: Alpha (Day)</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-slate-500">
            <span className="text-slate-500 tabular-nums">{timeStr}</span>
            <span className="flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 bg-emerald-500" /> SYSTEM NORMAL
            </span>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${
                currentPage === item.key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              <item.icon size={13} /> {item.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4">
          {currentPage === "dashboard" && <DashboardPage onNavigate={setCurrentPage} alerts={alerts} onAck={ack} />}
          {currentPage === "livemap" && <LiveMineMap onNavigate={setCurrentPage} />}
          {currentPage === "workers" && <WorkersPage />}
          {currentPage === "vehicles" && <VehiclesPage />}
          {currentPage === "ventilation" && <VentilationPage />}
          {currentPage === "water" && <WaterPage />}
          {currentPage === "equipment" && <EquipmentPage />}
          {currentPage === "alerts" && <AlertsPage alerts={alerts} onAck={ack} />}
          {currentPage === "reports" && <ReportsPage />}
          {currentPage === "history" && <HistoryPage />}
          {currentPage === "settings" && <SettingsPage />}
        </main>

        {/* Footer status bar */}
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-6 py-2.5 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="h-1.5 w-1.5 bg-emerald-500" /> Data Sync Active
          </span>
          <span>Last Update: {timeStr}</span>
          <span>Interval: 5s</span>
          <span className="flex items-center gap-1.5">
            <RefreshCw size={11} /> Edge Gateway: Connected
          </span>
          <span className="flex items-center gap-1.5 font-bold text-slate-400">
            AI MONITORING ENABLED
          </span>
        </footer>
      </div>
    </div>
  );
}
