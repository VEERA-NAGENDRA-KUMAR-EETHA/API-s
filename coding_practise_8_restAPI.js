const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
let db = null
const dbPath = path.join(__dirname, 'todoApplication.db')
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at https://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error message : ${e.message}`)
    process.exit(1)
  }
}

initializeDbServer()

const todoObjectToResponseObject = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  }
}

// GET status = 'TO DO'

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const getAllTodoQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%'`
  const getAllTodoList = await db.all(getAllTodoQuery)
  response.send(
    getAllTodoList.map(eachItem => todoObjectToResponseObject(eachItem)),
  )
})

// GET specific todo element

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoElementQuery = `SELECT * FROM todo WHERE id=${todoId}`
  const getTodoElement = await db.get(getTodoElementQuery)
  response.send(todoObjectToResponseObject(getTodoElement))
})

// POST todo element
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postTodoElementQuery = `
  INSERT INTO todo (id, todo, priority, status) 
  VALUES (${id}, '${todo}', '${priority}', '${status}');
  `
  await db.run(postTodoElementQuery)
  response.send('Todo Successfully Added')
})

module.exports = app
