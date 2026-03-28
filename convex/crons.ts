import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Verificare notificări la fiecare 30 de minute
// Convex rulează aceasta automat în cloud — nu necesită server propriu
crons.interval(
  "send-scheduled-notifications",
  { minutes: 30 },
  internal.notifications.checkAndSend
);

export default crons;
