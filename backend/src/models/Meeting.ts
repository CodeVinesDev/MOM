import mongoose, { Schema, Document } from "mongoose";

export interface IParticipant {
  name: string;
  email: string;
}

export interface IMeeting extends Document {
  title: string;
  date: Date;
  participants: IParticipant[];
  rawTranscript: string;
  summary: string;
  decisions: string[];
  actionItems: mongoose.Types.ObjectId[];
  momSentAt?: Date;
  emailStatus: "pending" | "sent" | "failed";
  tags: string[];
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    participants: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    rawTranscript: { type: String, required: true },
    summary: { type: String, default: "" },
    decisions: { type: [String], default: [] },
    actionItems: [{ type: Schema.Types.ObjectId, ref: "ActionItem" }],
    momSentAt: Date,
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    tags: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IMeeting>("Meeting", MeetingSchema);
