export type EmailProps = {
    html: string
    text?: string
    subject: string
    to: string[]
    /**
     * @description caminho para os arquivos que serao anexados
     */
    attachments: string[]
}
export class Email {
    constructor(private props: EmailProps) { }

    get getProps() { return this.props };
}