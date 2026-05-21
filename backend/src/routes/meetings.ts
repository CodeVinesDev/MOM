import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Meeting from "../models/Meeting";
import ActionItem from "../models/ActionItem";
import { generateMOM } from "../services/aiService";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/meetings — upload transcript, run AI, save MOM
router.post(
  "/",
  upload.single("transcript"),
  async (req: Request, res: Response) => {
    try {
      const { title, date, participants } = req.body;
      const parsedParticipants = JSON.parse(participants);

      let transcript = "";
      if (req.file) {
        transcript = fs.readFileSync(req.file.path, "utf-8");
      } else if (req.body.transcript) {
        transcript = req.body.transcript;
      } else {
        return res.status(400).json({ error: "Transcript required" });
      }

      const mom = await generateMOM(transcript, parsedParticipants);

      const meeting = await Meeting.create({
        title: mom.title || title,
        date: new Date(date),
        participants: parsedParticipants,
        rawTranscript: transcript,
        summary: mom.summary,
        decisions: mom.decisions,
        tags: mom.tags,
      });

      const actionDocs = await ActionItem.insertMany(
        mom.actionItems.map((item) => ({
          meetingId: meeting._id,
          task: item.task,
          assignee: item.assignee,
          assigneeEmail: item.assigneeEmail,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
        })),
      );

      meeting.actionItems = actionDocs.map((a) => a._id);
      await meeting.save();

      res.status(201).json({ meeting, actionItems: actionDocs });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  },
);

// GET /api/meetings
router.get("/", async (_req: Request, res: Response) => {
  const meetings = await Meeting.find()
    .sort({ date: -1 })
    .populate("actionItems")
    .lean();
  res.json(meetings);
});

// GET /api/meetings/:id
router.get("/:id", async (req: Request, res: Response) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate("actionItems")
    .lean();
  if (!meeting) return res.status(404).json({ error: "Not found" });
  res.json(meeting);
});

// PATCH /api/meetings/:id — edit MOM before sending
router.patch("/:id", async (req: Request, res: Response) => {
  const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(meeting);
});

export default router;
