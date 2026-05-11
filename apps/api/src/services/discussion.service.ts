import * as DiscussionModel from '../models/discussion.model';
import { emitToLesson } from '../lib/socket';

export const addMessage = async (lessonId: number, userId: number, message: string) => {
  const discussionMessage = await DiscussionModel.createDiscussionMessage(lessonId, userId, message);
  
  // Broadcast to all users in this lesson's room
  emitToLesson(lessonId.toString(), 'new_discussion_message', discussionMessage);
  
  return discussionMessage;
};

export const getMessages = async (lessonId: number) => {
  return await DiscussionModel.getDiscussionsByLessonId(lessonId);
};
