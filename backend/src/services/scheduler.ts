import cron from "node-cron";
import ActionItem from "../models/ActionItem";
import { sendActionReminder } from "./emailService";

// Runs every day at 8 AM — sends reminders for items due in ≤ 2 days
export function initScheduler(): void {
  cron.schedule("0 8 * * *", async () => {
    console.log("[Scheduler] Checking upcoming action items...");
    const soon = new Date();
    soon.setDate(soon.getDate() + 2);

    const items = await ActionItem.find({
      status: { $ne: "done" },
      reminderSent: false,
      dueDate: { $lte: soon, $gte: new Date() },
    });

    for (const item of items) {
      try {
        await sendActionReminder(
          item.assigneeEmail,
          item.assignee,
          item.task,
          item.dueDate,
        );
        item.reminderSent = true;
        await item.save();
        console.log(`[Scheduler] Reminder sent to ${item.assigneeEmail}`);
      } catch (e) {
        console.error(`[Scheduler] Failed for ${item.assigneeEmail}:`, e);
      }
    }
  });
}
