import * as MailComposer from "expo-mail-composer";

async function sendMail(subject, recipients = [], body, attachments = []) {
    return MailComposer.composeAsync({
        subject: subject,
        recipients: recipients,
        body: body,
        isHtml: true,
        attachments
    });
}

export { sendMail };