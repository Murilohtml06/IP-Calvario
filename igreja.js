// Recupera os alunos do LocalStorage
let alunos = JSON.parse(localStorage.getItem('alunos')) || [];

// Função para salvar os dados no LocalStorage
function salvarDados() {
    localStorage.setItem('alunos', JSON.stringify(alunos));
}

// Função para cadastrar um aluno
function cadastrarAluno() {
    const nome = document.getElementById('nomeAluno').value.trim();
    const matricula = document.getElementById('matriculaAluno').value.trim();

    if (nome && matricula.length >= 2) {
        const codigoSala = matricula.substring(0, 2); // Pega os dois primeiros números
        const sala = salas[codigoSala] || "Sala Desconhecida"; // Associa a sala ou define como desconhecida

        const ultimosQuatro = matricula.slice(-4);

        // Verificando se já existe uma matrícula com os mesmos últimos 4 dígitos
        const repetido = alunos.some(aluno => aluno.matricula.slice(-4) === ultimosQuatro);

        if (repetido) {
            alert("Os quatro últimos dígitos da matrícula já estão em uso. Escolha outra matrícula.");
            return;
        }

        const alunoExiste = alunos.some(aluno => aluno.matricula === matricula);
        if (alunoExiste) {
            alert("Aluno já cadastrado com esta matrícula!");
            return;
        }

        const aluno = {
            nome: nome,
            matricula: matricula,
            sala: sala,
            presencas: {}
        };

        alunos.push(aluno);
        document.getElementById('nomeAluno').value = '';
        document.getElementById('matriculaAluno').value = '';

        alert(`Aluno cadastrado com sucesso na ${sala}!`);

        salvarDados();
        atualizarListaAlunos();
        atualizarSelectAlunos();
    } else {
        alert("Por favor, preencha todos os campos corretamente. A matrícula deve ter pelo menos dois números.");
    }
}


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


// Função para atualizar a lista de alunos cadastrados
function atualizarListaAlunos() {
    const salasContainer = document.getElementById('salasContainer');
    const quantidadeSalas = document.getElementById('quantidadeSalas');
    salasContainer.innerHTML = ''; // Limpa a lista antes de atualizar
    quantidadeSalas.innerHTML = ''; // Limpa a contagem antes de atualizar

    const alunosPorSala = {}; // Objeto para armazenar alunos organizados por sala

    // Organiza os alunos por sala e conta quantos tem em cada uma
    alunos.forEach(aluno => {
        if (!alunosPorSala[aluno.sala]) {
            alunosPorSala[aluno.sala] = [];
        }
        alunosPorSala[aluno.sala].push(aluno);
    });

    // Ordena as salas em ordem crescente
    const salasOrdenadas = Object.keys(alunosPorSala).sort((a, b) => {
        const numeroA = parseInt(a.match(/\d+/)); // Extrai o número da sala
        const numeroB = parseInt(b.match(/\d+/));
        return numeroA - numeroB; // Ordena em ordem crescente
    });

    // Criar e exibir a lista de cada sala na ordem correta
    salasOrdenadas.forEach(sala => {
        // Exibir a quantidade de alunos por sala
        const contadorSala = document.createElement('p');
        contadorSala.textContent = `${sala}: ${alunosPorSala[sala].length} aluno(s)`;
        quantidadeSalas.appendChild(contadorSala);

        // Criar a seção da sala
        const divSala = document.createElement('div');
        divSala.classList.add('sala');

        const tituloSala = document.createElement('h3');
        tituloSala.textContent = sala;

        const lista = document.createElement('ul');

        alunosPorSala[sala].forEach(aluno => {
            const li = document.createElement('li');
            li.textContent = `${aluno.nome} (Matrícula: ${aluno.matricula})`;

            // Criar botão de remover
            const botaoRemover = document.createElement('button');
            botaoRemover.textContent = "Remover";
            botaoRemover.classList.add("remover");
            botaoRemover.onclick = function () {
                if (confirm(`Deseja realmente remover ${aluno.nome}?`)) {
                    alunos.splice(alunos.indexOf(aluno), 1);
                    salvarDados();
                    atualizarListaAlunos();
                    atualizarSelectAlunos();
                }
            };

            li.appendChild(botaoRemover);
            lista.appendChild(li);
        });

        divSala.appendChild(tituloSala);
        divSala.appendChild(lista);
        salasContainer.appendChild(divSala);
    });
}

// Função para atualizar o select de alunos para registrar presença
function atualizarSelectAlunos() {
    const alunosSelect = document.getElementById('alunosSelect');
    alunosSelect.innerHTML = '<option value="">Selecione um aluno</option>';

    alunos.forEach((aluno, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = aluno.nome;
        alunosSelect.appendChild(option);
    });
}

// Função para registrar presença de um aluno
function registrarPresenca() {
    const alunoIndex = document.getElementById('alunosSelect').value;
    const data = document.getElementById('dataPresenca').value;
    const presenca = document.getElementById('statusPresenca').value;

    if (alunoIndex === "" || !data) {
        alert("Por favor, selecione um aluno e informe a data.");
        return;
    }

    // Registra a presença ou ausência do aluno na data
    alunos[alunoIndex].presencas[data] = parseInt(presenca);

    alert("Presença registrada com sucesso!");

    salvarDados(); // Atualiza os dados no LocalStorage
}

// Função para contar o número de presentes e ausentes
function contarPresencas() {
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

    // Atualiza a exibição na tela
    document.getElementById('contagemResultados').innerHTML = `
        <strong>Presentes:</strong> ${resultados.presentes.length} (${resultados.presentes.join(',')})<br>
        <strong>Ausentes:</strong> ${resultados.ausentes.length} (${resultados.ausentes.join(',')})
    `;
}


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modalSenha");
    const botaoVerificar = document.getElementById("senha");
    const inputsSenha = document.querySelectorAll(".box");

    // Exibir a tela de senha ao carregar a página
    modal.style.display = "flex";

    // Função para limpar os campos da senha e voltar ao primeiro input
    function limparCamposSenha() {
        inputsSenha.forEach(input => input.value = ""); // Limpa todos os inputs
        inputsSenha[0].focus(); // Foca no primeiro campo
    }

    // Função para verificar a senha
    botaoVerificar.addEventListener("click", function () {
        let senhaCorreta = "1234"; // Senha definida
        let senhaDigitada = [...inputsSenha].map(input => input.value).join('');

        if (senhaDigitada.length < 4) {
            alert("Preencha todos os campos!");
            return;
        }

        if (senhaDigitada === senhaCorreta) {
            modal.style.display = "none"; // Fecha o modal se a senha estiver correta
        } else {
            alert("Senha incorreta!");
            limparCamposSenha(); // Apaga os campos e volta o foco para o primeiro
        }
    });

    // Permitir a navegação automática entre os campos
    inputsSenha.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value && index < inputsSenha.length - 1) {
                inputsSenha[index + 1].focus();
            }
        });
    });
});


// Carrega os dados iniciais ao abrir a página
window.onload = function () {
    atualizarListaAlunos();
    atualizarSelectAlunos();
};
