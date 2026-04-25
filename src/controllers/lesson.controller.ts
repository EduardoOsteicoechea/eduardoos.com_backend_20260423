import type { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { authDb } from "../db";
import { lecciones } from "../db/auth-schema";
import type { CreateLessonBody, UpdateLessonBody } from "../validators/lesson.validators";

export class LessonController {
  createLesson = (request: Request<unknown, unknown, CreateLessonBody>, response: Response): void => {
    const authenticatedUserId = request.authenticatedUser?.userId;
    if (!authenticatedUserId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const createdLesson = authDb
      .insert(lecciones)
      .values({
        title: request.body.title,
        content: request.body.content,
        authorId: authenticatedUserId
      })
      .returning()
      .get();

    response.status(201).json(createdLesson);
  };

  getLessons = (_request: Request, response: Response): void => {
    const lessons = authDb.select().from(lecciones).orderBy(desc(lecciones.createdAt)).all();
    response.status(200).json(lessons);
  };

  getLessonById = (request: Request<{ id: string }>, response: Response): void => {
    const lessonId = Number(request.params.id);
    if (!Number.isInteger(lessonId)) {
      response.status(400).json({ message: "Invalid lesson id" });
      return;
    }

    const lesson = authDb.select().from(lecciones).where(eq(lecciones.id, lessonId)).get();
    if (!lesson) {
      response.status(404).json({ message: "Lesson not found" });
      return;
    }

    response.status(200).json(lesson);
  };

  updateLesson = (
    request: Request<{ id: string }, unknown, UpdateLessonBody>,
    response: Response
  ): void => {
    const authenticatedUserId = request.authenticatedUser?.userId;
    if (!authenticatedUserId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const lessonId = Number(request.params.id);
    if (!Number.isInteger(lessonId)) {
      response.status(400).json({ message: "Invalid lesson id" });
      return;
    }

    const lesson = authDb.select().from(lecciones).where(eq(lecciones.id, lessonId)).get();
    if (!lesson) {
      response.status(404).json({ message: "Lesson not found" });
      return;
    }
    if (lesson.authorId !== authenticatedUserId) {
      response.status(403).json({ message: "Forbidden" });
      return;
    }

    const updatedLesson = authDb
      .update(lecciones)
      .set({
        ...(request.body.title !== undefined ? { title: request.body.title } : {}),
        ...(request.body.content !== undefined ? { content: request.body.content } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(and(eq(lecciones.id, lessonId), eq(lecciones.authorId, authenticatedUserId)))
      .returning()
      .get();

    response.status(200).json(updatedLesson);
  };

  deleteLesson = (request: Request<{ id: string }>, response: Response): void => {
    const authenticatedUserId = request.authenticatedUser?.userId;
    if (!authenticatedUserId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const lessonId = Number(request.params.id);
    if (!Number.isInteger(lessonId)) {
      response.status(400).json({ message: "Invalid lesson id" });
      return;
    }

    const deletedLesson = authDb
      .delete(lecciones)
      .where(and(eq(lecciones.id, lessonId), eq(lecciones.authorId, authenticatedUserId)))
      .returning({ id: lecciones.id })
      .get();

    if (!deletedLesson) {
      response.status(404).json({ message: "Lesson not found" });
      return;
    }

    response.status(200).json({ message: "Lesson deleted" });
  };
}
