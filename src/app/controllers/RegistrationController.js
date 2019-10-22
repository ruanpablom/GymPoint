import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Queue from '../../lib/Queue';
import RegistrationMail from '../jobs/RegistrationMail';

import Plan from '../models/Plan';
import Student from '../models/Student';
import Registration from '../models/Registration';

class RegistrationController {
  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { start_date, plan_id, student_id } = req.body;

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.price * plan.duration;

    const registration = await Registration.create({
      plan_id,
      student_id,
      start_date,
      end_date,
      price,
    });

    const mailData = {
      student: student.name,
      email: student.email,
      plan: { title: plan.title, price, end_date },
    };

    await Queue.add(RegistrationMail.key, {
      mailData,
    });

    return res.json(registration);
  }
}

export default new RegistrationController();
