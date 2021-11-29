const { Router } = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const router = Router()
const User = require('../models/User')

//Получение всех пользователей

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ owner: req.user.userId }).select('-__v')
    res.json(users)
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.delete('/deleteUser/:id', async (req, res) => {
  try {
      await User.findByIdAndRemove({ _id: req.params.id })
      res.status(200).json({ message: "Пользователь удален" })
  } catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

module.exports = router

