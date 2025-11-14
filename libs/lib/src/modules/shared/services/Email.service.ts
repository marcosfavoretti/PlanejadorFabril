import { Injectable } from '@nestjs/common';
import { Email } from '../@core/classes/Email';
import { EmailClient } from '../@core/client/email.client';
import { INotificaEmail } from '../@core/interfaces/INotificaEmail';
import { EnriqueceHtml } from '../@core/decorator/enriquece-html.decorator';

@Injectable()
export class EmailService implements INotificaEmail {
  @EnriqueceHtml
  async send(email: Email): Promise<void> {
    try {
      await EmailClient.post('/email', email.getProps);
    } catch (error) {
      console.error(error);
      throw new Error('Falha no envio de email');
    }
  }
}
