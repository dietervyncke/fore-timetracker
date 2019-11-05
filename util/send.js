import * as MailComposer from "expo-mail-composer";

async function sendMail(subject, recipients = [], body, attachments = []) {
    return MailComposer.composeAsync({
        recipients: recipients,
        subject: subject,
        body: body,
        isHtml: true,
        attachments
    });
}

export { sendMail };