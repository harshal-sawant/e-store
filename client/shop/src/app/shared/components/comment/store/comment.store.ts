import {
  CommentsActions,
  INITIALIZECOMMENTS,
  ADDCOMMENT,
  UPDATECOMMENT,
  COMMENTS_SUCCESS,
} from './comment.actions';
import { Comment } from '../../../../core/interfaces/comment.model';

export interface AppState {
  commentsState: CommentsState;
}

export interface CommentsState {
  comments: any[];
  error: string;
}

export const initialState: CommentsState = {
  comments: [],
  error: '',
};

export function commentsReducer(
  state: CommentsState = initialState,
  action: any
): CommentsState {
  switch (action.type) {
    case INITIALIZECOMMENTS:
      // const initComments = action.payload || state.comments;
      // return { ...state, comments: [...state.comments, ...initComments] };
      const initComments =
        action.payload !== undefined ? action.payload : state.comments;
      return { ...state, comments: initComments };
    case ADDCOMMENT:
      const { comment: newComment } = action.payload;
      return { ...state, comments: [...state.comments, newComment] };

    case UPDATECOMMENT:
      const { comment: updatedComment } = action.payload;
      let tempState = [...state.comments];
      for (let i = 0; i < tempState.length; i++) {
        if (tempState[i].uid == updatedComment.uid) {
          tempState[i] = updatedComment;
        }
      }
      return { ...state, comments: tempState };
    case COMMENTS_SUCCESS:
      let result: any = [];
      const { comments } = action.payload;
      for (let key of Object.keys(comments)) {
        result.push(
          new Comment(
            comments[key].uid,
            comments[key].username,
            comments[key].comment,
            comments[key].rating
          )
        );
      }
      return { ...state, comments: result };
    default:
      return state;
  }
}
