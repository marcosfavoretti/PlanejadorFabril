import { Email } from "../classes/Email";
import * as Mailgen from 'mailgen'

var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'planejamento fabril',
        link: 'http://192.168.99.102:8080/planejamento'
    }
});

export function EnriqueceHtml(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const original = descriptor.value;
    descriptor.value = async function (email: Email, ...args: any[]) {
        const emailTemplate = {
            body: {
                name: email.getProps.to[0],
                intro: email.getProps.subject,
                outro: email.getProps.html || email.getProps.text,
            },
        };
        email.getProps.html = mailGenerator.generate(emailTemplate);

        return original.apply(this, [email, ...args]);
    };
}