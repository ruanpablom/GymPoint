import { Op } from 'sequelize';
import { subDays } from 'date-fns';

import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
      },
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const today = new Date();

    const checkinsIn7Days = await Checkin.findAndCountAll({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [subDays(today, 7), today],
        },
      },
    });

    if (checkinsIn7Days.count >= 5) {
      return res.status(400).json({ error: 'Limit of check ins exceeded' });
    }

    const checkin = await Checkin.create({ student_id: req.params.id });

    return res.json(checkin);
  }
}

export default new CheckinController();
