import { Email } from "../classes/Email";

export interface INotificaEmail{
    send(email: Email):Promise<void>;
}