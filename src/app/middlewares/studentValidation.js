import Student from '../models/Student';

export default async (req, res, next) => {
  const student = await Student.findByPk(req.params.id);
  if (!student) {
    res.status(400).json({ error: 'Student does not exists' });
  }

  req.studentId = req.params.id;

  return next();
};
