import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const plan = await Plan.create(req.body);

    return res.json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }
    const { duration, price, title } = req.body;

    const plan = await Plan.findByPk(req.params.id);
    if (!plan) {
      return res.status(400).json({ error: 'plan does not exists' });
    }

    if (duration) {
      plan.duration = duration;
    }
    if (price) {
      plan.price = price;
    }
    if (title) {
      plan.title = title;
    }

    await plan.save();

    return res.json(plan);
  }

  async delete(req, res) {
    const plan = await Plan.destroy({ where: { id: req.params.id } });
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    return res.json({ success: 'Plan deleted' });
  }
}

export default new PlanController();
