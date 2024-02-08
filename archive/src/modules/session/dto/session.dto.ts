import { UserDocument } from "src/modules/user/schemas/user.schema";
import { Session } from "../schemas/session.schema";

export type PopulatedSession = Omit<Session, 'user'> & {
  user: UserDocument;
};