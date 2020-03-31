//usei o express para criar e configurar meu servior
const express = require('express');
const server = express();

const db = require("./db");

//configurar arquivos estáticos(.css, imagens, scripts) no node e express
server.use(express.static("public"))

//habilitar uso do req.body
server.use(express.urlencoded({ extended: true }))

//configuração do nunjucks
const nunjucks = require('nunjucks');
nunjucks.configure("views", {
  express: server,
  noCache: true,
})

//criei uma rota chamada / e /ideias
// e capturo o pedido do cliente para responder
server.get("/", function(request, response) {

  db.all(`SELECT * FROM ideas`, function(err, rows) {
    if (err) {
      console.log(err)
      return response.send("Erro no banco de dados!")
    }
    
    const reversedIdeas = [...rows].reverse()

    let lastIdeas = []
    for (let idea of reversedIdeas) {
      if (lastIdeas.length < 2) {
        lastIdeas.push(idea)
      } 
    }

    return response.render('index.html', { ideas: lastIdeas })
  })
})

server.get("/ideias", function(request, response) {
  db.all(`SELECT * FROM ideas`, function(err, rows) {
    if (err) {
      console.log(err)
      return response.send("Erro no banco de dados!")
    }

    const reversedIdeas = [...rows].reverse() 

    return response.render('ideias.html', { ideas: reversedIdeas })
  })
})


server.post("/", function(request, response) {
  //inserindo dados na tabela
  const query = `
  INSERT INTO ideas (
    id,
    image, 
    title, 
    category, 
    description, 
    link
  ) VALUES (?, ?, ?, ?, ?, ?);
  `
  const values = [
    request.body.id,
    request.body.image,
    request.body.title,
    request.body.category,
    request.body.description,
    request.body.link,
  ]

  db.run(query, values, function(err) {
    if (err) {
      console.log(err)
      return response.send("Erro no banco de dados!")
    }

    return response.redirect("/ideias")
  })
})

server.get('/ideias/:id', function(request, response) {
  const deleteIdea = `DELETE FROM ideas WHERE id = ?;`
  const { id } = request.params;

  db.run(deleteIdea, id, function(err){
    if (err) {
      console.log(err)
      return response.send("Não foi possível apagar a ideia")
    }
    return response.redirect('/ideias')
  })
});

server.listen(3000);