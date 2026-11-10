export interface Skill {
  name: string;
  level: number; // 0–100
  icon: string;
  detail: string;
}

export const skills: Skill[] = [
  { name: "C++",        level: 92, icon: "</>",  detail: "Sockets, multi-threading, memory management, systems programming" },
  { name: "Linux",      level: 75, icon: "$_",   detail: "CLI, process management, shell scripting, networking" },
  { name: "Python",     level: 70, icon: "py",   detail: "Automation, backend tooling, data handling" },
  { name: "C",          level: 68, icon: "*.c",  detail: "Core low-level programming & algorithms" },
  { name: "Docker",     level: 65, icon: "dock", detail: "Containerization & local deployment" },
  { name: "Databases",  level: 65, icon: "db",   detail: "Relational schemas, query optimization, persistence" },
  { name: "AWS",        level: 60, icon: "cld",  detail: "Cloud fundamentals, compute, storage" },
];

export const concepts: string[] = [
  "TCP/IP",
  "UDP",
  "Multithreading",
  "Concurrent Server Design",
  "Memory Pools",
  "Epoll / Select",
  "POSIX Sockets",
  "IPC",
  "Process Management",
  "Lock-free Structures",
  "Buffer Management",
  "Protocol Design",
];

/** Experience / education timeline */
export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export const timeline: TimelineItem[] = [
  {
    year: "2025",
    title: "Started B.Tech IT",
    description: "SRMS College of Engineering & Technology — began exploring systems programming.",
  },
  {
    year: "2025",
    title: "Built TCP Chat Server",
    description: "Multi-client real-time chat on raw sockets in C++ — deployed on Render.",
  },
  {
    year: "2026",
    title: "SIH — Jaldrisht",
    description: "Dam-break inundation modelling with automated HADR report generation.",
  },
  {
    year: "2026",
    title: "SAMBAL App",
    description: "Post-grief guidance mobile app helping families through bureaucratic processes.",
  },
];
