const API_URL = "http://localhost:4000";

let alunos = [];

const salas = {
    "10": "PG 1",
    "20": "PG 2",
    "30": "PG 3",
    "40": "PG 4",
    "50": "PG 5",
    "60": "PG 6",
    "70": "PG 7",
    "80": "PG 8"
};


// Função para cadastrar um aluno
async function cadastrarAluno() {
    const nome = document.getElementById('nomeAluno').value.trim();
    const matricula = document.getElementById('matriculaAluno').value.trim();
    const codigoSala = matricula.substring(0, 2);
    const sala = salas[codigoSala] || "Sala Desconhecida";

    if (!nome || !matricula) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const aluno = { nome, matricula, sala, presencas: {} };

    try {
        const resposta = await fetch(`${API_URL}/alunos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aluno)
        });

        if (resposta.ok) {
            alert("Aluno cadastrado com sucesso!");
            carregarAlunos();
        } else {
            alert("Erro ao cadastrar aluno.");
        }
    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);
    }
}

// Função para carregar alunos do banco de dados
async function carregarAlunos() {
    try {
        const resposta = await fetch(`${API_URL}/alunos`);
        alunos = await resposta.json();
        atualizarListaAlunos();
        atualizarSelectAlunos();
    } catch (error) {
        console.error("Erro ao carregar alunos:", error);
    }
}

// Função para atualizar a lista de alunos
function atualizarListaAlunos() {
    const salasContainer = document.getElementById('salasContainer');
    const quantidadeSalas = document.getElementById('quantidadeSalas');
    salasContainer.innerHTML = '';
    quantidadeSalas.innerHTML = '';

    const alunosPorSala = {};

    alunos.forEach(aluno => {
        if (!alunosPorSala[aluno.sala]) {
            alunosPorSala[aluno.sala] = [];
        }
        alunosPorSala[aluno.sala].push(aluno);
    });

    Object.keys(alunosPorSala).sort().forEach(sala => {
        const contadorSala = document.createElement('p');
        contadorSala.textContent = `${sala}: ${alunosPorSala[sala].length} aluno(s)`;
        quantidadeSalas.appendChild(contadorSala);

        const divSala = document.createElement('div');
        divSala.classList.add('sala');

        const tituloSala = document.createElement('h3');
        tituloSala.textContent = sala;

        const lista = document.createElement('ul');

        alunosPorSala[sala].forEach(aluno => {
            const li = document.createElement('li');
            li.textContent = `${aluno.nome} (Matrícula: ${aluno.matricula})`;

            const botaoRemover = document.createElement('button');
            botaoRemover.textContent = "Remover";
            botaoRemover.classList.add("remover");
            botaoRemover.onclick = () => removerAluno(aluno._id);

            li.appendChild(botaoRemover);
            lista.appendChild(li);
        });

        divSala.appendChild(tituloSala);
        divSala.appendChild(lista);
        salasContainer.appendChild(divSala);
    });
}

// Função para remover aluno do banco de dados
async function removerAluno(id) {
    if (!confirm("Tem certeza que deseja remover este aluno?")) return;

    try {
        const resposta = await fetch(`${API_URL}/alunos/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("Aluno removido com sucesso!");
            carregarAlunos();
        } else {
            alert("Erro ao remover aluno.");
        }
    } catch (error) {
        console.error("Erro ao remover aluno:", error);
    }
}

// Função para atualizar o select de alunos para registrar presença
function atualizarSelectAlunos() {
    const alunosSelect = document.getElementById('alunosSelect');
    alunosSelect.innerHTML = '<option value="">Selecione um aluno</option>';

    alunos.forEach(aluno => {
        const option = document.createElement('option');
        option.value = aluno._id;
        option.textContent = aluno.nome;
        alunosSelect.appendChild(option);
    });
}

// Função para registrar presença de um aluno
async function registrarPresenca() {
    const alunoId = document.getElementById('alunosSelect').value;
    const data = document.getElementById('dataPresenca').value;
    const presenca = document.getElementById('statusPresenca').value;

    if (!alunoId || !data) {
        alert("Por favor, selecione um aluno e informe a data.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/presenca/${alunoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, status: parseInt(presenca) })
        });

        if (resposta.ok) {
            alert("Presença registrada com sucesso!");
        } else {
            alert("Erro ao registrar presença.");
        }
    } catch (error) {
        console.error("Erro ao registrar presença:", error);
    }
}

// Função para contar o número de presentes e ausentes
async function contarPresencas() {
    try {
        const resposta = await fetch(`${API_URL}/alunos`);
        const alunos = await resposta.json();

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

        document.getElementById('contagemResultados').innerHTML = `
            <strong>Presentes:</strong> ${resultados.presentes.length} (${resultados.presentes.join(', ')})<br>
            <strong>Ausentes:</strong> ${resultados.ausentes.length} (${resultados.ausentes.join(', ')})
        `;
    } catch (error) {
        console.error("Erro ao contar presenças:", error);
    }
}

// Inicializa os dados ao carregar a página
window.onload = carregarAlunos;

// Configuração do modal de senha
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modalSenha");
    const botaoVerificar = document.getElementById("senha");
    const inputsSenha = document.querySelectorAll(".box");

    modal.style.display = "flex";

    function limparCamposSenha() {
        inputsSenha.forEach(input => input.value = "");
        inputsSenha[0].focus();
    }

    botaoVerificar.addEventListener("click", function () {
        let senhaCorreta = "1234";
        let senhaDigitada = [...inputsSenha].map(input => input.value).join('');

        if (senhaDigitada.length < 4) {
            alert("Preencha todos os campos!");
            return;
        }

        if (senhaDigitada === senhaCorreta) {
            modal.style.display = "none";
        } else {
            alert("Senha incorreta!");
            limparCamposSenha();
        }
    });

    inputsSenha.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value && index < inputsSenha.length - 1) {
                inputsSenha[index + 1].focus();
            }
        });
    });
});