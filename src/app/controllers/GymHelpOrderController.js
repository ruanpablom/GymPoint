import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import Queue from '../../lib/Queue';
import HelpOrderAnswerMail from '../jobs/HelpOrderAnswerMail';

class GymHelpOrderController {
  async index(req, res) {
    const helpOrdersWithoutAnswer = await HelpOrder.findAll({
      where: { answer: null },
    });

    return res.json(helpOrdersWithoutAnswer);
  }

  async store(req, res) {
    const { answer } = req.body;
    if (!answer) {
      res.status(400).json({ error: 'You must send an answer' });
    }
    const helpOrderToAnswer = await HelpOrder.findOne({
      where: { id: req.params.id, answer: null },
    });
    if (!helpOrderToAnswer) {
      return res
        .status(400)
        .json({ error: 'Help order not found or answered' });
    }

    helpOrderToAnswer.answer = answer;
    helpOrderToAnswer.answer_at = new Date();

    helpOrderToAnswer.save();

    /**
     * Mail to student with answer
     */
    const student = await Student.findByPk(helpOrderToAnswer.student_id);

    const mailData = {
      student: student.name,
      email: student.email,
      answer,
      question: helpOrderToAnswer.question,
    };

    await Queue.add(HelpOrderAnswerMail.key, {
      mailData,
    });

    return res.json(helpOrderToAnswer);
  }
}

export default new GymHelpOrderController();
