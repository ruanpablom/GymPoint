import HelpOrder from '../models/HelpOrder';

class StudentHelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.studentId },
    });
    return res.json(helpOrders);
  }

  async store(req, res) {
    const { question } = req.body;

    if (!question) {
      res.status(400).json({ error: 'You need to send a question' });
    }

    const helpOrder = await HelpOrder.create({
      student_id: req.studentId,
      question,
    });

    return res.json(helpOrder);
  }
}

export default new StudentHelpOrderController();
