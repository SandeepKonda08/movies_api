const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// get api
app.get('/movies/', async (request, response) => {
  const query = `
                          SELECT
                            *
                          FROM
                            movie ;
                           `
  const moviesArray = await db.all(query)

  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//add movie api

app.post(`/movies/`, async (request, response) => {
  const getDetails = request.body

  let {directorId, movieName, leadActor} = getDetails

  const addmoviequery = `
         INSERT INTO 
         movie (director_id,movie_name,lead_actor )
        values(
          ${directorId},
          '${movieName}',
          '${leadActor}')
  
  `

  const dbResponse = await db.run(addmoviequery)
  response.send('Movie Successfully Added')
})

//get movie api

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const singlemoviequery = `
                          SELECT
                            *
                          FROM
                            movie 
                            where movie_id = ${movieId};
                           `
  const obj = await db.get(singlemoviequery)
  let {movie_id, director_id, movie_name, lead_actor} = obj

  const dbResponse = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  }
  response.send(dbResponse)
})

//update

app.put(`/movies/:movieId/`, async (request, response) => {
  const {movieId} = request.params
  const getDetails = request.body

  let {directorId, movieName, leadActor} = getDetails

  const updatemoviequery = `
         UPDATE
             movie 
         SET 
             director_id = ${directorId} ,
             movie_name =  '${movieName}',
             lead_actor = '${leadActor}'

        
         WHERE movie_id = ${movieId} ;
  
  `

  await db.run(updatemoviequery)
  response.send('Movie Details Updated')
})

//delete

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletemovieQuery = `
    delete
      from movie
    where
      movie_id = ${movieId};`
  await db.run(deletemovieQuery)
  response.send('Movie Removed')
})

//get api
app.get('/directors/', async (request, response) => {
  const query = `
                          SELECT
                            *
                          FROM
                            director ;
                           `
  const directorArray = await db.all(query)

  response.send(
    directorArray.map(eachMovie => ({
      directorId: eachMovie.director_id,
      directorName: eachMovie.director_name,
    })),
  )
})

//get api

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const query = `
                          SELECT
                            *
                          FROM
                            movie inner join director 
                            on director.director_id = movie.director_id 
                            where director.director_id = ${directorId};
                           `
  const directorArray = await db.all(query)

  response.send(
    directorArray.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

module.exports = app
