import { Router } from "express";
import { LessonController } from "../controllers/lesson.controller";
import { authenticate } from "../middleware/authenticate";
import { validateRequestBody } from "../middleware/validateRequest";
import { createLessonSchema, updateLessonSchema } from "../validators/lesson.validators";

const lessonController = new LessonController();

export const lessonRouter = Router();

lessonRouter.use(authenticate);

lessonRouter.post("/lecciones", validateRequestBody(createLessonSchema), lessonController.createLesson);
lessonRouter.get("/lecciones", lessonController.getLessons);
lessonRouter.get("/lecciones/:id", lessonController.getLessonById);
lessonRouter.put("/lecciones/:id", validateRequestBody(updateLessonSchema), lessonController.updateLesson);
lessonRouter.delete("/lecciones/:id", lessonController.deleteLesson);
