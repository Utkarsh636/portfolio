export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  image?: string; // path under /public/assets/projects/
  status: "live" | "wip" | "deployed";
}

export const projects: Project[] = [
  {
    id: "sambal",
    title: "SAMBAL",
    description:
      "A post-grief guidance mobile application built to assist grieving families through bureaucratic processes after a loss — claiming Provident Fund, procuring death certificates, and managing paperwork.",
    tags: ["Flutter", "Mobile", "Social Impact"],
    githubUrl: "https://github.com/Utkarsh636/sambal_flutter",
    status: "live",
  },
  {
    id: "jaldrisht",
    title: "Jaldrisht",
    description:
      "Dam-break inundation modeling and simulation system with automated Humanitarian Assistance and Disaster Relief (HADR) report generation for rapid emergency response.",
    tags: ["Simulation", "Disaster Response", "HADR"],
    status: "wip",
  },
  {
    id: "tcp-chat",
    title: "TCP Chat Server",
    description:
      "High-performance, multi-client real-time chat server built entirely from scratch on raw TCP sockets in C++.",
    tags: ["C++", "Raw Sockets", "Systems Architecture"],
    liveUrl: "https://tcp-chat-server-t4ez.onrender.com/",
    status: "deployed",
  },
];
