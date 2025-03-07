const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB (usando banco local por enquanto)
mongoose.connect("mongodb+srv://murilo:06122009@cluster0.5xg8g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


// Criar esquema do Aluno
const AlunoSchema = new mongoose.Schema({
    nome: String,
    matricula: String,
    sala: String,
    presencas: Object
});

const Aluno = mongoose.model("Aluno", AlunoSchema);

// Rota para cadastrar um aluno
app.post("/alunos", async (req, res) => {
    const aluno = new Aluno(req.body);
    await aluno.save();
    res.json({ message: "Aluno cadastrado!" });
});

// Rota para listar alunos
app.get("/alunos", async (req, res) => {
    const alunos = await Aluno.find();
    res.json(alunos);
});

// Rota para registrar presença
app.put("/presenca/:id", async (req, res) => {
    const { id } = req.params;
    const { data, status } = req.body;
    const aluno = await Aluno.findById(id);
    aluno.presencas[data] = status;
    await aluno.save();
    res.json({ message: "Presença registrada!" });
});

app.listen(4000, () => console.log("Servidor rodando na porta 4000"));