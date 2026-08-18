import { getPublicSiteUrl } from "@/lib/utils";

export const siteConfig = {
  name: "Automated Student Planner",
  shortName: "ASP",
  description:
    "An AI-powered student workspace for seamless notes, document chat, assignment planning, flashcards, quizzes, and active recall study tools.",
  url: getPublicSiteUrl(),
  ogImage: "https://asp-planner.app/og.png",
  links: {
    github: "https://github.com/asp-planner/asp",
    docs: "/help",
  },
  author: "ASP Engineering Team",
  version: "0.1.0-module1",
};
