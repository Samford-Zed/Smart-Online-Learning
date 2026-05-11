import * as InteractionModel from '../models/interaction.model';
import * as StudentModel from '../models/student.model';

const verifyGradeAccess = async (userId: number, lessonId: number) => {
  const grade = await StudentModel.getStudentGrade(userId);
  if (!grade) throw new Error('Grade not found for student');

  const lesson = await StudentModel.getLessonById(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const subject = await StudentModel.getSubjectById(lesson.subject_id);
  if (!subject) throw new Error('Subject not found');

  if (subject.grade !== grade) {
    throw new Error('Unauthorized access to content from another grade');
  }
};

export const getQuiz = async (userId: number, quizId: number) => {
  const quiz = await InteractionModel.getQuizById(quizId);
  if (!quiz) throw new Error('Quiz not found');

  await verifyGradeAccess(userId, quiz.lesson_id);

  const questions = await InteractionModel.getQuestionsByQuizId(quizId);
  return { ...quiz, questions };
};

export const submitQuiz = async (userId: number, quizId: number, answers: { questionId: number, selectedOption: string }[]) => {
  const quiz = await InteractionModel.getQuizById(quizId);
  if (!quiz) throw new Error('Quiz not found');

  await verifyGradeAccess(userId, quiz.lesson_id);

  const submissionCount = await InteractionModel.getSubmissionCount(userId, quizId);
  if (submissionCount >= quiz.max_attempts) {
    throw new Error('Maximum attempts reached for this quiz');
  }

  let score = 0;
  const totalQuestions = answers.length; // Or we could fetch total questions from DB to prevent partial submissions

  // Evaluate answers
  const evaluatedAnswers = await Promise.all(answers.map(async (ans) => {
    const question = await InteractionModel.getQuestionWithAnswer(ans.questionId);
    if (!question || question.quiz_id !== quizId) {
      throw new Error(`Invalid question ID: ${ans.questionId}`);
    }
    const isCorrect = question.correct_option === ans.selectedOption;
    if (isCorrect) score++;
    return { ...ans, isCorrect };
  }));

  // Create submission
  const submissionId = await InteractionModel.createQuizSubmission(userId, quizId, score, totalQuestions);

  // Save individual answers
  await Promise.all(evaluatedAnswers.map(ans => 
    InteractionModel.createUserAnswer(submissionId, ans.questionId, ans.selectedOption, ans.isCorrect)
  ));

  return { submissionId, score, totalQuestions };
};

export const getAssignments = async (userId: number, lessonId: number) => {
  await verifyGradeAccess(userId, lessonId);
  return await InteractionModel.getAssignmentsByLessonId(lessonId);
};

export const submitAssignment = async (userId: number, assignmentId: number, content?: string, fileUrl?: string) => {
  if (!content && !fileUrl) {
    throw new Error('Must provide either content or fileUrl');
  }

  const assignment = await InteractionModel.getAssignmentById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  await verifyGradeAccess(userId, assignment.lesson_id);

  return await InteractionModel.createAssignmentSubmission(userId, assignmentId, content, fileUrl);
};

export const updateVideoProgress = async (userId: number, videoId: number, watchedDuration: number, isCompleted: boolean) => {
  const video = await InteractionModel.getVideoById(videoId);
  if (!video) throw new Error('Video not found');

  await verifyGradeAccess(userId, video.lesson_id);

  return await InteractionModel.upsertVideoProgress(userId, videoId, watchedDuration, isCompleted);
};
