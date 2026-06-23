import Subject from "./models/subject.model";
import Logging from "../middleware/logging";
import { SUBJECT_CATALOG } from "./assessment.constants";

// Idempotent: run on every boot. Renames the legacy "maths" (code MAT) subject
// to "mathematics" in place, and creates any catalog subjects that don't exist yet.
export async function seedSubjects(): Promise<void> {
  for (const entry of SUBJECT_CATALOG) {
    const existing = await Subject.findOne({
      $or: [{ name: entry.name }, { code: entry.code }],
    });

    if (existing) {
      if (existing.name !== entry.name || existing.description !== entry.description) {
        existing.name = entry.name;
        existing.description = entry.description;
        await existing.save();
      }
    } else {
      await Subject.create({
        name: entry.name,
        code: entry.code,
        description: entry.description,
      });
    }
  }

  Logging.info("✅ Subject catalog seeded/verified");
}
