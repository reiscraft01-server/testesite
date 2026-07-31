const PRODUTOS = {
  vips: {
    titulo: "Escolha seu VIP",
    exclusivo: true,
    cor: "#ffd700",
    itens: [
      {
        id: "vip_ferro",
        nome: "VIP Ferro",
        preco: 16.02,
        moeda: "USD",
        tebexId: 7588021,
        cor: "#c0c0c0",
        icone: "ðŸ›¡",
        imagem: "assets/vip-guerreiro.webp",
        imagemKit: "assets/kit-guerreiro.webp",
        descricao: "Kit Ferro exclusivo",
        beneficios: [
          "Full Ferro - ProteÃ§Ã£o IV",
          "Escudo - InquebrÃ¡vel III",
          "Ferramentas EficiÃªncia IV e AfiaÃ§Ã£o IV",
          "4x Totem da Imortalidade",
          "32x PÃ©rola do End",
          "64x FilÃ©",
          "16x MaÃ§Ã£ Dourada"
        ]
      },
      {
        id: "vip_diamante",
        nome: "VIP Diamante",
        preco: 19.04,
        moeda: "USD",
        tebexId: 7588026,
        cor: "#00d4ff",
        icone: "ðŸ’Ž",
        imagem: "assets/vip-supremo.webp",
        imagemKit: "assets/kit-supremo.webp",
        descricao: "Kit Diamante exclusivo",
        beneficios: [
          "Full Diamante - ProteÃ§Ã£o III",
          "Escudo - InquebrÃ¡vel III",
          "Ferramentas EficiÃªncia III e AfiaÃ§Ã£o III",
          "12x MaÃ§Ã£ Dourada",
          "32x PÃ©rola do End",
          "16x Diamantes",
          "3x MaÃ§Ã£ Dourada Encantada",
          "1x Melhoria de Netherita",
          "64x FilÃ©"
        ]
      },
      {
        id: "vip_netherite",
        nome: "VIP Netherite",
        preco: 25.03,
        moeda: "USD",
        tebexId: 7588030,
        cor: "#b060ff",
        icone: "âš”",
        imagem: "assets/vip-rei.webp",
        imagemKit: "assets/kit-rei.webp",
        descricao: "Kit Netherite exclusivo",
        beneficios: [
          "Full Netherite - ProteÃ§Ã£o IV",
          "Escudo - InquebrÃ¡vel III",
          "Ferramentas EficiÃªncia IV e AfiaÃ§Ã£o IV",
          "Mace",
          "LanÃ§a de Netherite Encantada",
          "7x Cristal do End",
          "5x MaÃ§Ã£ Dourada Encantada",
          "20x MaÃ§Ã£ Dourada",
          "64x PÃ©rola do End",
          "5 Packs de Foguete",
          "16x Obsidian",
          "5x Totem da Imortalidade",
          "1x Ã‰litro"
        ]
      },
      {
        id: "vip_rei",
        nome: "VIP Rei",
        preco: 50.07,
        moeda: "USD",
        tebexId: 7588032,
        cor: "#ffd700",
        icone: "ðŸ‘‘",
        imagem: "assets/vip-deus.webp",
        imagemKit: "assets/kit-deus.webp",
        descricao: "Kit Rei exclusivo",
        beneficios: [
          "Full Netherite - Full Enchant",
          "Escudo - Full Enchant",
          "Ferramentas EficiÃªncia V e AfiaÃ§Ã£o V",
          "32x MaÃ§Ã£ Dourada",
          "10x MaÃ§Ã£ Dourada Encantada",
          "32x PÃ©rola do End",
          "5 Packs de Foguete",
          "32x Obsidian",
          "10x Totem da Imortalidade",
          "1x Ã‰litro Full Enchant",
          "Mace Full Enchant",
          "LanÃ§a Full Enchant",
          "16x Cristal do End"
        ]
      }
    ]
  },
  extras: {
    titulo: "Extras",
    exclusivo: false,
    cor: "#ff8c00",
    itens: [
      {
        id: "home",
        nome: "Home Adicional",
        preco: 2.51,
        moeda: "USD",
        tebexId: 7588036,
        maxQtd: null,
        cor: "#ff8c00",
        icone: "ðŸ ",
        imagem: "assets/home.webp",
        descricao: "Adicione um novo ponto de teleporte."
      },
      {
        id: "desban",
        nome: "Seja Desbanido",
        preco: 50.05,
        moeda: "USD",
        tebexId: 7588047,
        maxQtd: 1,
        cor: "#ff4444",
        icone: "ðŸ”“",
        imagem: "assets/desban.webp",
        descricao: "Recupere seu acesso ao reino."
      }
    ]
  }
};

function getProduto(id) {
  for (const cat of Object.values(PRODUTOS)) {
    for (const item of cat.itens) {
      if (item.id === id) return item;
    }
  }
  return null;
}

function formatarPreco(valor) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}
