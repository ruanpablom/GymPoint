import * as Yup from 'yup';
import { addMonths, parseISO, isPast } from 'date-fns';

import Queue from '../../lib/Queue';
import RegistrationMail from '../jobs/RegistrationMail';

import Plan from '../models/Plan';
import Student from '../models/Student';
import Registration from '../models/Registration';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const registrations = await Registration.findAll({
      order: ['start_date'],
      attributes: ['id', 'start_date', 'end_date', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(registrations);
  }

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

    if (isPast(parseISO(start_date))) {
      return res.status(400).json({ error: 'Start date is on the past' });
    }

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

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      plan_id: Yup.number(),
      student_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const registration = await Registration.findByPk(req.params.id);

    const { plan_id, student_id, start_date } = req.body;

    const plan = await Plan.findByPk(plan_id || registration.plan_id);

    const student = await Student.findByPk(
      student_id || registration.student_id
    );

    if (!registration) {
      res.status(400).json({ error: 'Registration not found' });
    }

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    if (start_date) {
      if (isPast(parseISO(start_date))) {
        return res.status(400).json({ error: 'Start date is on the past' });
      }

      registration.start_date = parseISO(start_date);
    }

    registration.plan_id = plan_id || registration.plan_id;

    registration.student_id = student_id || registration.student_id;

    if (plan_id || start_date) {
      registration.end_date = addMonths(parseISO(start_date), plan.duration);
      registration.price = plan.price * plan.duration;
    }

    await registration.save();

    return res.json(registration);
  }

  async delete(req, res) {
    const registration = await Registration.destroy({
      where: { id: req.params.id },
    });
    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    return res.json({ success: 'Registration deleted' });
  }
}

export default new RegistrationController();
