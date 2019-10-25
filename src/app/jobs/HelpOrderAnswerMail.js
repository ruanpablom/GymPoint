import Mail from '../../lib/Mail';

class HelpOrderAnswerMail {
  get key() {
    return 'HelpOrderAnswerMail';
  }

  async handle({ data }) {
    const { mailData } = data;

    await Mail.sendMail({
      to: `${mailData.email} <${mailData.email}>`,
      subject: `Resposta GymPoint`,
      template: 'helpOrderAnswer',
      context: {
        student: mailData.student,
        question: mailData.question,
        answer: mailData.answer,
      },
    });
  }
}

export default new HelpOrderAnswerMail();
