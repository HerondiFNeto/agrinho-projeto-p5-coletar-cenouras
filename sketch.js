// Agrinho 2025 - Jogo do Robô coletor de cenouras
// Desenvolvido com p5.js
// Objetivo: coletar cenouras boas para somar pontos, evitar as sujas que tiram pontos.
// Ao atingir a pontuação alvo, o jogador vence.

// Constantes para configuração do jogo
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

const PONTOS_PARA_VENCER = 30;
const PONTOS_CENOURA_BOA = 2;
const PONTOS_CENOURA_SUJA = -4;

const PROBABILIDADE_CENOURA_BOA = 0.7;

const COR_FUNDO_PAINEL = [50, 50, 50, 200]; // cor RGBA do painel informativo (cinza escuro translúcido)

let robo;
let cenouras = [];
let pontos = 0;

let imgFundo;
let imgRobo;
let imgCenouraBoa;
let imgCenouraSuja;

function preload() {
  // Carregamento das imagens utilizadas no jogo
  imgFundo = loadImage("fundo.png");
  imgRobo = loadImage("robô.png");
  imgCenouraBoa = loadImage("cenoura_boa.png");
  imgCenouraSuja = loadImage("cenoura_suja.png");
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  robo = new Robo();
  textAlign(LEFT);
}

function draw() {
  // Desenha o fundo
  image(imgFundo, 0, 0, width, height);

  // Atualiza e mostra o robô
  robo.mover();
  robo.mostrar();

  // Cria novas cenouras a cada 60 frames (~1 segundo)
  if (frameCount % 60 === 0) {
    cenouras.push(new Cenoura());
  }

  // Atualiza, mostra e verifica colisões das cenouras
  for (let i = cenouras.length - 1; i >= 0; i--) {
    let cenoura = cenouras[i];
    cenoura.atualizar();
    cenoura.mostrar();

    if (cenoura.colidiuCom(robo)) {
      // Ajusta pontos conforme tipo de cenoura
      if (cenoura.boa) {
        pontos += PONTOS_CENOURA_BOA;
      } else {
        pontos = max(0, pontos + PONTOS_CENOURA_SUJA); // decrementa com limite mínimo 0
      }
      cenouras.splice(i, 1); // remove cenoura coletada
    } else if (cenoura.y > height) {
      cenouras.splice(i, 1); // remove cenoura que saiu da tela
    }
  }

  // Desenha o painel de informações (fundo translúcido atrás dos textos)
  fill(...COR_FUNDO_PAINEL);
  noStroke();
  rect(5, 5, width - 10, 150, 10);

  // Exibe informações e instruções na tela
  fill(255); // branco para contraste
  textSize(20);
  text(`Pontos: ${pontos}`, 10, 30);

  textSize(16);
  text(`Objetivo: ${PONTOS_PARA_VENCER} pontos`, 10, 60);

  textSize(14);
  text("Use ← / A para mover para esquerda", 10, 90);
  text("Use → / D para mover para direita", 10, 110);
  text(`Pegue cenouras boas (+${PONTOS_CENOURA_BOA} pontos)`, 10, 130);
  text(`Evite cenouras sujas (${PONTOS_CENOURA_SUJA} pontos)`, 10, 150);

  // Verifica se o jogador venceu
  if (pontos >= PONTOS_PARA_VENCER) {
    textSize(32);
    textAlign(CENTER);
    fill(0);
    text("Você venceu!", width / 2, height / 2);
    noLoop(); // para o jogo
  }
}

// Classe que representa o robô jogador
class Robo {
  constructor() {
    this.x = width / 2;
    this.largura = 120; // largura do sprite do robô
    this.altura = 156;  // altura do sprite do robô
    this.y = height - this.altura;
    this.vel = 5;

    // Área de colisão do robô (retângulo interno para melhor precisão)
    this.colisaoXOffset = 15;
    this.colisaoYOffset = 10;
    this.colisaoLargura = this.largura - 30; // largura colisão
    this.colisaoAltura = this.altura - 40;   // altura colisão (reduzida no eixo Y para evitar pegar cenouras distantes)
  }

  mover() {
    // Movimento com teclas A, D ou setas esquerda/direita
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      this.x -= this.vel;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      this.x += this.vel;
    }
    // Mantém o robô dentro da tela
    this.x = constrain(this.x, 0, width - this.largura);
  }

  mostrar() {
    image(imgRobo, this.x, this.y, this.largura, this.altura);
  }

  getAreaColisao() {
    return {
      x: this.x + this.colisaoXOffset,
      y: this.y + this.colisaoYOffset,
      largura: this.colisaoLargura,
      altura: this.colisaoAltura
    };
  }
}

// Classe que representa as cenouras (boas e sujas)
class Cenoura {
  constructor() {
    this.x = random(20, width - 63);
    this.y = 0;

    this.boa = random(1) < PROBABILIDADE_CENOURA_BOA;

    // Tamanho das cenouras, a suja é um pouco maior para compensar o desenho
    if (this.boa) {
      this.largura = 60;
      this.altura = 80;
    } else {
      this.largura = 63;
      this.altura = 84;
    }

    this.vel = random(3, 6);
  }

  mostrar() {
    if (this.boa) {
      image(imgCenouraBoa, this.x, this.y, this.largura, this.altura);
    } else {
      image(imgCenouraSuja, this.x, this.y, this.largura, this.altura);
    }
  }

  atualizar() {
    this.y += this.vel;
  }

  colidiuCom(robo) {
    let roboArea = robo.getAreaColisao();
    return (
      this.x + this.largura > roboArea.x &&
      this.x < roboArea.x + roboArea.largura &&
      this.y + this.altura > roboArea.y &&
      this.y < roboArea.y + roboArea.altura
    );
  }
}
