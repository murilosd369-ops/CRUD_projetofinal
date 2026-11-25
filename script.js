let produtos = JSON.parse(localStorage.getItem("produtosMuriTech")) || [];

let codigoEmEdicao = null;
let codigoParaExcluir = null;

const telaLista = document.getElementById("tela-lista");
const telaFormulario = document.getElementById("tela-formulario");
const telaExclusao = document.getElementById("tela-exclusao");

const formulario = document.getElementById("form-produto");

const campoCodigo = document.getElementById("codigo");
const campoNome = document.getElementById("nome");
const campoDescricao = document.getElementById("descricao");
const campoPreco = document.getElementById("preco");
const campoFoto = document.getElementById("foto");

const imagemPreview = document.getElementById("preview");
const textoSemImagem = document.getElementById("sem-imagem");


function gerarCodigo() {
    let caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";

    for (let i = 0; i < 4; i++) {
        let numero = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres.charAt(numero);
    }

    for (let i = 0; i < produtos.length; i++) {
        if (produtos[i].codigo === codigo) {
            return gerarCodigo();
        }
    }

    return codigo;
}


function salvarNoNavegador() {
    localStorage.setItem("produtosMuriTech", JSON.stringify(produtos));
}


function mostrarTela(tela) {
    telaLista.classList.add("escondido");
    telaFormulario.classList.add("escondido");
    telaExclusao.classList.add("escondido");

    document.getElementById("link-lista").classList.remove("ativo");
    document.getElementById("link-cadastro").classList.remove("ativo");

    if (tela === "lista") {
        telaLista.classList.remove("escondido");
        document.getElementById("link-lista").classList.add("ativo");

        listarProdutos();

    } else if (tela === "formulario") {
        telaFormulario.classList.remove("escondido");
        document.getElementById("link-cadastro").classList.add("ativo");

    } else {
        telaExclusao.classList.remove("escondido");
    }
}


function abrirCadastro() {
    formulario.reset();

    codigoEmEdicao = null;

    campoCodigo.value = gerarCodigo();

    document.getElementById("titulo-formulario").textContent = "Cadastro de produto";
    document.getElementById("botao-salvar").textContent = "Cadastrar produto";

    limparPreview();

    mostrarTela("formulario");
}


function atualizarPreview() {
    let nomeImagem = campoFoto.value.trim();

    if (nomeImagem === "") {
        limparPreview();
        return;
    }

    imagemPreview.src = "imagens/" + nomeImagem + ".png";

    imagemPreview.style.display = "block";
    textoSemImagem.style.display = "none";

    imagemPreview.onerror = function() {
        imagemPreview.style.display = "none";

        textoSemImagem.textContent = "Imagem não encontrada.";
        textoSemImagem.style.display = "block";
    };
}


function limparPreview() {
    imagemPreview.removeAttribute("src");

    imagemPreview.style.display = "none";

    textoSemImagem.textContent = "A imagem aparecerá aqui";
    textoSemImagem.style.display = "block";

    let botoes = document.querySelectorAll(".opcao-imagem");

    for (let i = 0; i < botoes.length; i++) {
        botoes[i].classList.remove("selecionada");
    }
}


campoFoto.addEventListener("input", function() {
    atualizarPreview();
    marcarImagemSelecionada();
});


let botoesImagem = document.querySelectorAll(".opcao-imagem");

for (let i = 0; i < botoesImagem.length; i++) {
    botoesImagem[i].addEventListener("click", function() {

        campoFoto.value = botoesImagem[i].dataset.imagem;

        atualizarPreview();
        marcarImagemSelecionada();
    });
}


function marcarImagemSelecionada() {
    let botoes = document.querySelectorAll(".opcao-imagem");

    for (let i = 0; i < botoes.length; i++) {

        if (botoes[i].dataset.imagem === campoFoto.value.trim()) {
            botoes[i].classList.add("selecionada");
        } else {
            botoes[i].classList.remove("selecionada");
        }
    }
}


formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    let nome = campoNome.value.trim();
    let descricao = campoDescricao.value.trim();
    let preco = Number(campoPreco.value);
    let foto = campoFoto.value.trim();

    if (nome === "" || descricao === "" || campoPreco.value === "" || foto === "") {
        alert("Preencha todos os campos.");
        return;
    }

    if (nome.length < 5) {
        alert("O nome deve ter pelo menos 5 caracteres.");
        campoNome.focus();
        return;
    }

    if (isNaN(preco) || preco <= 0) {
        alert("Informe um preço válido.");
        campoPreco.focus();
        return;
    }

    if (foto.length > 10) {
        alert("O nome da imagem deve ter no máximo 10 caracteres.");
        campoFoto.focus();
        return;
    }

    let produto = {
        codigo: campoCodigo.value,
        nome: nome,
        descricao: descricao,
        preco: preco,
        foto: foto
    };

    if (codigoEmEdicao === null) {

        produtos.push(produto);

        alert("Produto cadastrado com sucesso!");

    } else {

        for (let i = 0; i < produtos.length; i++) {

            if (produtos[i].codigo === codigoEmEdicao) {
                produtos[i] = produto;
                break;
            }
        }

        alert("Produto alterado com sucesso!");
    }

    salvarNoNavegador();

    formulario.reset();
    limparPreview();

    mostrarTela("lista");
});


function listarProdutos() {

    let corpoTabela = document.getElementById("corpo-tabela");
    let mensagemVazia = document.getElementById("mensagem-vazia");

    corpoTabela.innerHTML = "";

    if (produtos.length === 0) {
        mensagemVazia.style.display = "block";
        return;
    }

    mensagemVazia.style.display = "none";

    for (let i = 0; i < produtos.length; i++) {

        let produto = produtos[i];

        let linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${escaparHTML(produto.nome)}</td>
            <td>${escaparHTML(produto.descricao)}</td>
            <td>R$ ${produto.preco.toFixed(2).replace(".", ",")}</td>

            <td>
                <div class="acoes-tabela">
                    <button class="botao-pequeno" type="button"
                    onclick="editarProduto('${produto.codigo}')">Editar</button>

                    <button class="botao-pequeno excluir" type="button"
                    onclick="abrirExclusao('${produto.codigo}')">Excluir</button>
                </div>
            </td>
        `;

        corpoTabela.appendChild(linha);
    }
}


function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function editarProduto(codigo) {

    let produto = null;

    for (let i = 0; i < produtos.length; i++) {

        if (produtos[i].codigo === codigo) {
            produto = produtos[i];
            break;
        }
    }

    if (produto === null) {
        return;
    }

    codigoEmEdicao = codigo;

    campoCodigo.value = produto.codigo;
    campoNome.value = produto.nome;
    campoDescricao.value = produto.descricao;
    campoPreco.value = produto.preco;
    campoFoto.value = produto.foto;

    document.getElementById("titulo-formulario").textContent = "Alteração de produto";
    document.getElementById("botao-salvar").textContent = "Salvar alterações";

    atualizarPreview();
    marcarImagemSelecionada();

    mostrarTela("formulario");
}


function abrirExclusao(codigo) {

    let produto = null;

    for (let i = 0; i < produtos.length; i++) {

        if (produtos[i].codigo === codigo) {
            produto = produtos[i];
            break;
        }
    }

    if (produto === null) {
        return;
    }

    codigoParaExcluir = codigo;

    document.getElementById("detalhes-exclusao").innerHTML = `
        <div class="detalhe-produto">

            <img src="imagens/${escaparHTML(produto.foto)}.png"
            alt="Imagem do produto"
            onerror="this.style.display='none'">

            <div>
                <p><strong>Código:</strong> ${produto.codigo}</p>
                <p><strong>Produto:</strong> ${escaparHTML(produto.nome)}</p>
                <p><strong>Descrição:</strong> ${escaparHTML(produto.descricao)}</p>
                <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
            </div>

        </div>
    `;

    mostrarTela("exclusao");
}


document.getElementById("confirmar-exclusao").addEventListener("click", function() {

    let novaLista = [];

    for (let i = 0; i < produtos.length; i++) {

        if (produtos[i].codigo !== codigoParaExcluir) {
            novaLista.push(produtos[i]);
        }
    }

    produtos = novaLista;

    salvarNoNavegador();

    codigoParaExcluir = null;

    alert("Produto excluído.");

    mostrarTela("lista");
});


document.getElementById("link-lista").addEventListener("click", function() {
    mostrarTela("lista");
});


document.getElementById("link-cadastro").addEventListener("click", abrirCadastro);
document.getElementById("novo-produto").addEventListener("click", abrirCadastro);



document.getElementById("cancelar-formulario").addEventListener("click", function() {

    formulario.reset();

    limparPreview();

    mostrarTela("lista");
});



document.getElementById("cancelar-exclusao").addEventListener("click", function() {

    codigoParaExcluir = null;

    mostrarTela("lista");
});



listarProdutos();



const botaoTema = document.getElementById("botao-tema");


if (localStorage.getItem("modoEscuro") === "sim") {
    document.body.classList.add("modo-escuro");
    botaoTema.textContent = "☀️ Modo claro";
}


botaoTema.addEventListener("click", function() {

    document.body.classList.toggle("modo-escuro");

    
    if (document.body.classList.contains("modo-escuro")) {

        botaoTema.textContent = "☀️ Modo claro";

        localStorage.setItem("modoEscuro", "sim");

    } else {

        botaoTema.textContent = "🌙 Modo escuro";

        localStorage.setItem("modoEscuro", "nao");
    }
});