const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());

// Configuração do CORS para permitir requisições do frontend
app.use(cors());

// Conectar ao MongoDB (substitua pela sua URL do MongoDB Atlas)
mongoose.connect("mongodb+srv://murilo:06122009@cluster0.5xg8g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Conectado ao MongoDB");
}).catch((error) => {
    console.error("Erro ao conectar ao MongoDB:", error);
});

// Definir esquema do aluno com matrícula como ID
const { Schema, model } = mongoose;

const AlunoSchema = new Schema({
    _id: String, // Matricula será o ID
    nome: String,
    sala: String,
    presencas: Object
}, { _id: false }); // Evita que o Mongoose crie um ObjectId automático

const Aluno = model("Aluno", AlunoSchema);

// Rota para cadastrar um aluno
app.post("/alunos", async (req, res) => {
    try {
        const { nome, _id, sala } = req.body;
        const aluno = new Aluno({ _id, nome, sala, presencas: {} });

        await aluno.save();
        res.json({ message: "Aluno cadastrado!" });
    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);
        res.status(500).json({ error: "Erro ao cadastrar aluno" });
    }
});

// Rota para listar alunos
app.get("/alunos", async (req, res) => {
    try {
        const alunos = await Aluno.find();
        res.json(alunos);
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
        res.status(500).json({ error: "Erro ao listar alunos" });
    }
});

// Rota para deletar aluno pela matrícula
app.delete("/alunos/:matricula", async (req, res) => {
    try {
        const { matricula } = req.params;
        const alunoRemovido = await Aluno.findOneAndDelete({ _id: matricula });

        if (!alunoRemovido) {
            return res.status(404).json({ error: "Aluno não encontrado" });
        }

        res.json({ message: "Aluno removido com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar aluno:", error);
        res.status(500).json({ error: "Erro ao deletar aluno" });
    }
});

// Rota para registrar presença
app.put("/presenca/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data, status } = req.body;
        const aluno = await Aluno.findById(id);

        if (!aluno) {
            return res.status(404).json({ error: "Aluno não encontrado" });
        }

        aluno.presencas[data] = status;
        await aluno.save();
        res.json({ message: "Presença registrada!" });
    } catch (error) {
        console.error("Erro ao registrar presença:", error);
        res.status(500).json({ error: "Erro ao registrar presença" });
    }
});

// Rota para contar presenças e ausências
app.get("/contar-presencas", async (req, res) => {
    try {
        const alunos = await Aluno.find();
        const resultados = {
            presentes: [],
            ausentes: []
        };

        alunos.forEach(aluno => {
            let alunoPresente = false;
            let alunoAusente = false;

            for (let data in aluno.presencas) {
                if (aluno.presencas[data] === 1) {
                    alunoPresente = true;
                } else {
                    alunoAusente = true;
                }
            }

            if (alunoPresente) {
                resultados.presentes.push(aluno.nome);
            }
            if (alunoAusente) {
                resultados.ausentes.push(aluno.nome);
            }
        });

        res.json(resultados);
    } catch (error) {
        console.error("Erro ao contar presenças:", error);
        res.status(500).json({ error: "Erro ao contar presenças" });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});