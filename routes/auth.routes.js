const { Router } = require('express')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const SA = require('../models/SA')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth.middleware')
const router = Router()

//api/auth/registerMember

router.post(
  '/memberRegister',
  [
    check('firstName', 'Длина поля не меньше 3 символов').isLength({ min: 3 }),
    check('lastName', 'Длина поля не меньше 3 символов').isLength({ min: 3 }),
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов')
      .isLength({ min: 6 }),
    check('phone', 'Некорректный телефон').isLength({ max: 11 })
  ],
  async (req, res) => {
    try {
      console.log(111111);
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }

      const {
        firstName,
        lastName,
        email,
        login,
        phone,
        role,
        password
      } = req.body

      const candidateEmail = await SA.findOne({ email }) || await User.findOne({ email })
      const candidatePhone = await SA.findOne({ phone }) || await User.findOne({ phone })

      if (candidatePhone) {
        return res.status(400).json({ message: 'Пользователь с таким номером уже существует', resultCode: 1 })
      }

      if (candidateEmail) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует', resultCode: 1 })
      }

      console.log(22222);
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({
        firstName,
        lastName,
        email,
        phone,
        login,
        role,
        password: hashedPassword
      })

      console.log(user);

      await user.save()

      console.log('what');

      res.status(201).json({ user, message: "Пользователь создан", resultCode: 0 })
    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова', e })
    }
  }
)

//api/auth/register
router.post(
  '/register',
  [
    check('firstName', 'Длина поля не меньше 3 символов').isLength({ min: 3 }),
    check('lastName', 'Длина поля не меньше 3 символов').isLength({ min: 3 }),
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов')
      .isLength({ min: 6 }),
    check('phone', 'Некорректный телефон').isLength({ max: 11 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации'
        })
      }

      const {
        firstName,
        lastName,
        phone,
        email,
        password,
        role
      } = req.body

      const candidateEmail = await SA.findOne({ email }) || await User.findOne({ email })
      const candidatePhone = await SA.findOne({ phone }) || await User.findOne({ phone })

      if (candidateEmail) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
      }

      if (candidatePhone) {
        return res.status(400).json({ message: 'Пользователь с таким номером телефона уже существует' })
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      const sa = new SA(
        {
          firstName,
          lastName,
          phone,
          email,
          password: hashedPassword,
          role
        }
      )

      await sa.save()

      res.status(201).json({ message: 'Администратор создан' })

    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
  }
)

//api/auth/login
router.post(
  '/login',
  [
    check('email', 'Введите корректный email').normalizeEmail().isEmail(),
    check('password', 'вВведите пароль').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при входе в систему'
        })
      }

      const { email, password } = req.body

      const user = await SA.findOne({ email }) || await User.findOne({ email })

      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль, попробуйте снова' })
      }

      const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expiresIn: '1h' }
      )

      res.json({ token, userId: user.id })

    } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
  }
)

router.get("/me", authMiddleware, async (req, res) => {
  const user =
    await SA.findById(req.user.userId).select("-password").select("-__v") ||
    await User.findById(req.user.userId).select("-password").select("-__v")

  res.json({ user, isAuth: true, message: 'Вы вошли в систему' });
});

module.exports = router

