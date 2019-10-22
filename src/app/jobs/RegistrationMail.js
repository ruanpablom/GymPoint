import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { mailData } = data;

    await Mail.sendMail({
      to: `${mailData.email} <${mailData.email}>`,
      subject: `Matrícula Gympoint`,
      template: 'registration',
      context: {
        student: mailData.student,
        plan: {
          title: mailData.plan.title,
          price: `R$${mailData.plan.price}`,
          end: format(parseISO(mailData.plan.end_date), "'dia' dd 'de' MMMM", {
            locale: pt,
          }),
        },
      },
    });
  }
}

export default new RegistrationMail();
