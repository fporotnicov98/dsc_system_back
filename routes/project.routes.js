const { Router } = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const router = Router()
const Project = require('../models/Project')

//Получение всех проектов и отдельного

router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId }).select('-__v')
    res.json(projects)
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('-__v')
    res.json(project)
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

// Новый проект

router.post('/addProject', authMiddleware, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user.userId
    })
    await project.save()
    res.status(201).json({ message: "Проект создан!", resultCode: 0 })
  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

// Обновление проекта

router.put("/updateProject/:id", async (req, res) => {
  try {
    const project = await Project.findById({ _id: req.params.id });

    project.projectName = req.body.projectName,
      project.repository = req.body.repository,
      project.description = req.body.description,
      project.editedDate = Date.now()
    project.edited = "1"

    await project.save()

    res.status(200).json({ message: "Проект обновлен!", resultCode: 0 })
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }
})

// Удаление проекта

router.delete("/deleteProject/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    await Project.findByIdAndRemove({ _id: req.params.id })
    res.status(200).json({ message: "Проект удален!" })
  } catch (e) {
    res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
  }

});

module.exports = router

